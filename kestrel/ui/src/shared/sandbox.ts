import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

Gio._promisify(Meta.Context.prototype, 'is_sender_unsandboxed');

export async function sandboxed(invocation: Gio.DBusMethodInvocation): Promise<boolean> {
  return !await global.context.is_sender_unsandboxed(invocation.get_connection(), invocation.get_sender()!, null);
}

export async function refuseSandboxed(invocation: Gio.DBusMethodInvocation, action: string): Promise<boolean> {
  if (!await sandboxed(invocation)) return false;
  invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', `Sandboxed apps cannot ${action}`);
  return true;
}
