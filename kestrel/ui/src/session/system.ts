import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ActionAvailability } from './interfaces.js';

export type PowerAction = 'PowerOff' | 'Reboot' | 'Suspend';

const LOGIN1 = 'org.freedesktop.login1';
const SESSION_TARGET = 'kestrel-session.target';
const AVAILABILITY: Record<string, number> = { yes: ActionAvailability.AVAILABLE, challenge: ActionAvailability.CHALLENGE };

function login1(method: string, parameters: GLib.Variant | null, replyType: string | null): Promise<GLib.Variant> {
  return Gio.DBus.system.call(LOGIN1, '/org/freedesktop/login1', 'org.freedesktop.login1.Manager', method, parameters,
    replyType ? new GLib.VariantType(replyType) : null, Gio.DBusCallFlags.NONE, -1, null);
}

export async function availability(action: PowerAction): Promise<number> {
  const [answer] = (await login1(`Can${action}`, null, '(s)')).deep_unpack() as [string];
  return AVAILABILITY[answer] ?? ActionAvailability.UNAVAILABLE;
}

export async function perform(action: PowerAction): Promise<void> {
  await login1(action, new GLib.Variant('(b)', [true]), null);
}

export async function stopSession(): Promise<void> {
  await Gio.DBus.session.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1', 'org.freedesktop.systemd1.Manager', 'StopUnit',
    new GLib.Variant('(ss)', [SESSION_TARGET, 'replace']), null, Gio.DBusCallFlags.NONE, -1, null);
}

export function exportEnvironment(variables: Record<string, string>): void {
  const entries = Object.entries(variables);
  try {
    Gio.DBus.session.call_sync('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'UpdateActivationEnvironment',
      new GLib.Variant('(a{ss})', [variables]), null, Gio.DBusCallFlags.NONE, -1, null);
    Gio.DBus.session.call_sync('org.freedesktop.systemd1', '/org/freedesktop/systemd1', 'org.freedesktop.systemd1.Manager', 'SetEnvironment',
      new GLib.Variant('(as)', [entries.map(([name, value]) => `${name}=${value}`)]), null, Gio.DBusCallFlags.NO_AUTO_START, -1, null);
  } catch (error) {
    console.warn(`Could not share ${entries.map(([name]) => name).join(', ')} with the session: ${error}`);
  }
}

export interface SessionState {
  active: boolean;
  locked: boolean;
}

export function watchSession(changed: (state: SessionState) => void): () => void {
  const cancellable = new Gio.Cancellable();
  let proxy: Gio.DBusProxy | null = null;
  Gio.DBusProxy.new_for_bus(Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null, LOGIN1, '/org/freedesktop/login1/session/auto',
    'org.freedesktop.login1.Session', cancellable, (_source, result) => {
      try {
        proxy = Gio.DBusProxy.new_for_bus_finish(result);
      } catch (error) {
        if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED)))
          console.warn(`Session state is unavailable: ${error}`);
        return;
      }
      const sync = () => changed({
        active: proxy!.get_cached_property('Active')?.get_boolean() ?? true,
        locked: proxy!.get_cached_property('LockedHint')?.get_boolean() ?? false,
      });
      proxy.connect('g-properties-changed', sync);
      sync();
    });
  return () => {
    cancellable.cancel();
    proxy = null;
  };
}
