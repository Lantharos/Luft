import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import { appName } from '../core/apps.js';
import { ENDED, SUCCESS, option, respond, type Invocation, type Options, type Outcome } from '../core/request.js';
import { jobOptions, type PageChoice } from './choices.js';
import { gtkPageSetup, gtkPreferences, gtkSettings } from './gtk.js';
import { choosePrint } from './printDialog.js';
import { listPrinters, submit, type JobOptions, type Printer } from './printers.js';

const PRINT_XML = `<node><interface name="org.freedesktop.impl.portal.Print">
  <method name="PreparePrint">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="a{sv}" direction="in"/><arg type="a{sv}" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="Print">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/>
    <arg type="h" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
</interface></node>`;

const TOKEN_LIFETIME_SECONDS = 300;

type PrepareArguments = [handle: string, appId: string, parent: string, title: string, settings: Options, pageSetup: Options, options: Options];
type PrintArguments = [handle: string, appId: string, parent: string, title: string, document: number, options: Options];

interface Prepared {
  readonly appId: string;
  readonly printer: Printer;
  readonly options: JobOptions;
  readonly expiry: number;
}

function dialogTitle(appId: string): string {
  return appId ? `Print from ${appName(appId)}` : 'Print';
}

function acceptLabel(options: Options): string {
  return option<string>(options, 'accept_label')?.replace(/_(.)/g, '$1') || 'Print';
}

async function availablePrinters(): Promise<Printer[]> {
  try {
    return await listPrinters();
  } catch (error) {
    console.warn(`Couldn't find printers: ${(error as Error).message}`);
    return [];
  }
}

function reportFailure(printer: Printer, appId: string): void {
  const source = MessageTray.getSystemSource();
  source.addNotification(new MessageTray.Notification({
    source,
    title: 'Couldn’t print',
    body: appId ? `${printer.description} didn’t take the document from ${appName(appId)}.` : `${printer.description} didn’t take the document.`,
    gicon: new Gio.ThemedIcon({ name: 'printer-error-symbolic' }),
  }));
}

export class PrintPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(PRINT_XML, this);
  private readonly prepared = new Map<number, Prepared>();

  async PreparePrintAsync([handle, appId, , , settings, pageSetup, options]: PrepareArguments, invocation: Invocation): Promise<void> {
    const pageChoices: PageChoice[] = ['all'];
    if (option<boolean>(options, 'has_current_page')) pageChoices.push('current');
    if (option<boolean>(options, 'has_selected_pages')) pageChoices.push('selection');
    pageChoices.push('ranges');
    const [response, choices] = await choosePrint(handle, {
      title: dialogTitle(appId),
      acceptLabel: acceptLabel(options),
      printers: await availablePrinters(),
      preferences: gtkPreferences(settings, pageSetup),
      pageChoices: () => pageChoices,
      orientation: true,
    });
    respond(invocation, choices ? [SUCCESS, {
      settings: gtkSettings(choices, settings),
      'page-setup': gtkPageSetup(choices, pageSetup),
      token: new GLib.Variant('u', this.remember({ appId, printer: choices.printer, options: jobOptions(choices, true) })),
    }] : [response, {}]);
  }

  async PrintAsync([handle, appId, , , document, options]: PrintArguments, invocation: Invocation): Promise<void> {
    const prepared = this.take(appId, option<number>(options, 'token'));
    if (prepared) {
      respond(invocation, await this.print(invocation, document, prepared));
      return;
    }
    const [response, choices] = await choosePrint(handle, {
      title: dialogTitle(appId),
      acceptLabel: 'Print',
      printers: await availablePrinters(),
      preferences: {},
      pageChoices: printer => printer.pageRanges ? ['all', 'ranges'] : ['all'],
      orientation: false,
    });
    respond(invocation, choices ? await this.print(invocation, document, { appId, printer: choices.printer, options: jobOptions(choices, false) }) : [response, {}]);
  }

  destroy(): void {
    for (const { expiry } of this.prepared.values()) GLib.source_remove(expiry);
    this.prepared.clear();
  }

  private async print(invocation: Invocation, document: number, { appId, printer, options }: Omit<Prepared, 'expiry'>): Promise<Outcome> {
    const name = appId ? `Document from ${appName(appId)}` : 'Document';
    try {
      await submit(printer.name, invocation.get_message().get_unix_fd_list()!.get(document), name, options);
      return [SUCCESS, {}];
    } catch (error) {
      console.warn(`Couldn't print on ${printer.name}: ${(error as Error).message}`);
      reportFailure(printer, appId);
      return [ENDED, {}];
    }
  }

  private remember(prepared: Omit<Prepared, 'expiry'>): number {
    let token = 0;
    while (token === 0 || this.prepared.has(token)) token = GLib.random_int();
    const expiry = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, TOKEN_LIFETIME_SECONDS, () => {
      this.prepared.delete(token);
      return GLib.SOURCE_REMOVE;
    });
    this.prepared.set(token, { ...prepared, expiry });
    return token;
  }

  private take(appId: string, token = 0): Prepared | undefined {
    const prepared = this.prepared.get(token);
    if (prepared?.appId !== appId) return undefined;
    GLib.source_remove(prepared.expiry);
    this.prepared.delete(token);
    return prepared;
  }
}
