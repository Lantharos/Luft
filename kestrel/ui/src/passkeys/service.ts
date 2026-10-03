import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import { LIBEXECDIR } from 'resource:///com/lantharos/kestrel/misc/config.js';

import type { Context } from '../context.js';
import type { Account, Purpose, Request } from './copy.js';
import { PasskeyPrompt } from './prompt.js';

const BUS_NAME = 'com.lantharos.Kestrel.Passkeys';
const PATH = '/com/lantharos/Kestrel/Passkeys';
const AGENT = `${LIBEXECDIR}/luft-passkeys`;
const PURPOSES: Purpose[] = ['register', 'sign-in', 'manage', 'registered', 'choose'];

const SERVICE_XML = `<node><interface name="com.lantharos.Kestrel.Passkeys1">
  <method name="Open"><arg type="a{sv}" direction="in"/><arg type="o" direction="out"/></method>
</interface></node>`;

async function isAgent(sender: string): Promise<boolean> {
  const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus',
    'GetConnectionUnixProcessID', new GLib.Variant('(s)', [sender]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
  const [pid] = reply.deepUnpack() as [number];
  try {
    return GLib.file_read_link(`/proc/${pid}/exe`) === AGENT;
  } catch {
    return false;
  }
}

function appName(pid: number | undefined): string | null {
  if (!pid) return null;
  return Shell.WindowTracker.get_default().get_app_from_pid(pid)?.get_name() ?? null;
}

function parse(details: Record<string, GLib.Variant>): Request {
  const value = <T>(key: string): T | undefined => details[key]?.deepUnpack() as T | undefined;
  const purpose = value<string>('purpose') as Purpose;
  if (!PURPOSES.includes(purpose)) throw new Error(`Unknown purpose ${purpose}`);
  const accounts = (value<[string, string][]>('accounts') ?? []).map(([name, displayName]): Account => ({ name, displayName }));
  return { purpose, site: value<string>('site') ?? '', app: appName(value<number>('requester')), accounts, fingerprint: value<string>('fingerprint') ?? null };
}

export class PasskeyPrompts {
  private readonly exported = Gio.DBusExportedObject.wrapJSObject(SERVICE_XML, this);
  private readonly prompts = new Set<PasskeyPrompt>();
  private readonly nameId: number;
  private readonly watches = new Map<string, number>();
  private serial = 0;

  constructor(private readonly context: Pick<Context, 'sessionMode'>) {
    this.exported.export(Gio.DBus.session, PATH);
    this.nameId = Gio.bus_own_name_on_connection(Gio.DBus.session, BUS_NAME, Gio.BusNameOwnerFlags.NONE, null, null);
  }

  async OpenAsync([details]: [Record<string, GLib.Variant>], invocation: Gio.DBusMethodInvocation): Promise<void> {
    const sender = invocation.get_sender()!;
    if (!await isAgent(sender)) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'Only Luft Passkeys can ask about passkeys');
      return;
    }
    if (this.context.sessionMode.isLocked) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', 'The screen is locked');
      return;
    }
    let request: Request;
    try {
      request = parse(details);
    } catch (error) {
      invocation.return_dbus_error('org.freedesktop.DBus.Error.InvalidArgs', String(error));
      return;
    }
    const prompt = new PasskeyPrompt(`${PATH}/Prompt${++this.serial}`, sender, request, () => this.prompts.delete(prompt));
    this.prompts.add(prompt);
    this.watch(sender);
    if (!await prompt.open()) {
      prompt.finish();
      invocation.return_dbus_error('org.freedesktop.DBus.Error.Failed', 'The prompt could not be shown');
      return;
    }
    invocation.return_value(new GLib.Variant('(o)', [prompt.path]));
  }

  private watch(sender: string): void {
    if (this.watches.has(sender)) return;
    this.watches.set(sender, Gio.bus_watch_name_on_connection(Gio.DBus.session, sender, Gio.BusNameWatcherFlags.NONE, null, () => {
      Gio.bus_unwatch_name(this.watches.get(sender)!);
      this.watches.delete(sender);
      for (const prompt of this.prompts) if (prompt.owner === sender) prompt.finish();
    }));
  }

  destroy(): void {
    for (const prompt of this.prompts) prompt.finish();
    for (const id of this.watches.values()) Gio.bus_unwatch_name(id);
    Gio.bus_unown_name(this.nameId);
    this.exported.unexport();
  }
}
