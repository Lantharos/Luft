import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const decoder = new TextDecoder();

async function processOf(sender: string): Promise<number> {
  const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'GetConnectionUnixProcessID',
    new GLib.Variant('(s)', [sender]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
  return (reply.deepUnpack() as [number])[0];
}

function inFlatpak(pid: number): boolean {
  try {
    Gio.File.new_for_path(`/proc/${pid}/root/.flatpak-info`).query_info('standard::type', Gio.FileQueryInfoFlags.NONE, null);
    return true;
  } catch (error) {
    return !(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND));
  }
}

function inSnap(pid: number): boolean {
  try {
    return decoder.decode(GLib.file_get_contents(`/proc/${pid}/cgroup`)[1]).includes('/snap.');
  } catch {
    return true;
  }
}

export function sandboxedProcess(pid: number): boolean {
  return inFlatpak(pid) || inSnap(pid);
}

export async function sandboxed(sender: string): Promise<boolean> {
  try {
    return sandboxedProcess(await processOf(sender));
  } catch {
    return true;
  }
}

export async function refuseSandboxed(invocation: Gio.DBusMethodInvocation, action: string): Promise<boolean> {
  if (!await sandboxed(invocation.get_sender()!)) return false;
  invocation.return_dbus_error('org.freedesktop.DBus.Error.AccessDenied', `Sandboxed apps cannot ${action}`);
  return true;
}
