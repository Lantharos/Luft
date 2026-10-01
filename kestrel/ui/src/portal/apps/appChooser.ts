import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import { appIcon } from '../../appearance/icons/appIcons.js';
import { openDialog, type PortalDialog } from '../core/dialog.js';
import { CANCELLED, SUCCESS, option, respond, type Invocation, type Options } from '../core/request.js';
import { choose, list, row } from '../core/rows.js';

const APP_CHOOSER_XML = `<node><interface name="org.freedesktop.impl.portal.AppChooser">
  <method name="ChooseApplication">
    <arg type="o" direction="in"/><arg type="s" direction="in"/><arg type="s" direction="in"/><arg type="as" direction="in"/><arg type="a{sv}" direction="in"/>
    <arg type="u" direction="out"/><arg type="a{sv}" direction="out"/>
  </method>
  <method name="UpdateChoices"><arg type="o" direction="in"/><arg type="as" direction="in"/></method>
</interface></node>`;

const STORE = 'com.lantharos.schelf.desktop';
const SCROLL_AFTER = 6;

interface Chooser {
  dialog: PortalDialog;
  lastChoice: string | null;
  contentType: string | null;
}

function installed(choices: string[]): GioUnix.DesktopAppInfo[] {
  return choices.map(id => GioUnix.DesktopAppInfo.new(`${id}.desktop`)).filter((info): info is GioUnix.DesktopAppInfo => !!info);
}

function appId(info: Gio.AppInfo): string {
  return info.get_id()!.replace(/\.desktop$/, '');
}

function heading(location: string | undefined, contentType: string | null): { title: string; description: string } {
  const kind = contentType ? Gio.content_type_get_description(contentType) : null;
  if (location) {
    const name = GLib.path_get_basename(GLib.uri_unescape_string(location, null) ?? location);
    return { title: `Open “${name}”`, description: kind ? `Choose an app for this ${kind.toLowerCase()}.` : 'Choose an app to open it.' };
  }
  return { title: 'Choose an app', description: kind ? `Choose an app for ${kind.toLowerCase()} files.` : 'Choose an app to continue.' };
}

function findInStore(store: GioUnix.DesktopAppInfo, contentType: string | null): void {
  const query = contentType ? Gio.content_type_get_description(contentType) : '';
  store.launch_uris([`schelf:search?${GLib.uri_escape_string(query, null, false)}`], (global as unknown as Shell.Global).create_app_launch_context(0, -1));
}

export class AppChooserPortal {
  readonly dbus = Gio.DBusExportedObject.wrapJSObject(APP_CHOOSER_XML, this);
  private readonly open = new Map<string, Chooser>();

  async ChooseApplicationAsync([handle, , , choices, options]: [string, string, string, string[], Options], invocation: Invocation): Promise<void> {
    const contentType = option<string>(options, 'content_type') || null;
    const location = option<string>(options, 'filename') || option<string>(options, 'uri');
    respond(invocation, await openDialog(handle, { ...heading(location, contentType), icon: 'application-x-executable-symbolic' }, dialog => {
      const chooser = { dialog, lastChoice: option<string>(options, 'last_choice') || null, contentType };
      this.open.set(handle, chooser);
      dialog.modal.connect('closed', () => this.open.delete(handle));
      this.fill(chooser, installed(choices));
    }));
  }

  UpdateChoices(handle: string, choices: string[]): void {
    const chooser = this.open.get(handle);
    if (chooser) this.fill(chooser, installed(choices));
  }

  private fill({ dialog, lastChoice, contentType }: Chooser, apps: GioUnix.DesktopAppInfo[]): void {
    apps.sort((a, b) => Number(appId(b) === lastChoice) - Number(appId(a) === lastChoice) || a.get_name().localeCompare(b.get_name()));
    let chosen = apps.find(app => appId(app) === lastChoice) ?? apps[0] ?? null;
    const confirm = () => dialog.finish(SUCCESS, { choice: new GLib.Variant('s', appId(chosen!)) });
    const rows = apps.map(app => row({ icon: appIcon(app, 28, { style_class: 'kestrel-portal-row-icon' }), title: app.get_name(), checked: app === chosen }));
    choose(rows, index => {
      if (apps[index] === chosen) confirm();
      chosen = apps[index];
    });
    dialog.content.destroy_all_children();
    dialog.content.add_child(apps.length ? list(rows, rows.length > SCROLL_AFTER) : row({ title: 'No installed app can open this' }));
    const store = GioUnix.DesktopAppInfo.new(STORE);
    dialog.buttons([
      { label: 'Cancel', action: dialog.cancel },
      ...store ? [{ label: 'Find an App', action: () => { findInStore(store, contentType); dialog.finish(CANCELLED); } }] : [],
      { label: 'Open', action: confirm, default: true, reactive: !!chosen },
    ]);
    const selected = rows.find(button => button.checked);
    if (selected) dialog.modal.setInitialKeyFocus(selected);
  }
}
