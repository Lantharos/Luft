import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

Gio._promisify(Meta.Context.prototype, 'identify_sender');

export type Caller = { kind: 'you' } | { kind: 'app'; app: string } | { kind: 'unknown' };

export async function identify(invocation: Gio.DBusMethodInvocation): Promise<Caller> {
  try {
    const app = await global.context.identify_sender(invocation.get_connection(), invocation.get_sender()!, null);
    return app ? { kind: 'app', app } : { kind: 'you' };
  } catch {
    return { kind: 'unknown' };
  }
}

export async function sandboxed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  return (await identify(invocation)).kind !== 'you';
}

export async function refuseSandboxed(invocation: Gio.DBusMethodInvocation, action: string): Promise<boolean> {
  if (!await sandboxed(invocation)) return false;
  invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', `Sandboxed apps cannot ${action}`);
  return true;
}
