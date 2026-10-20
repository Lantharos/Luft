import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

const decoder = new TextDecoder();

type TrustingContext = Meta.Context & { is_app_trusted(appId: string): boolean };

async function processOf(sender: string): Promise<number> {
  const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'GetConnectionUnixProcessID',
    new GLib.Variant('(s)', [sender]), new GLib.VariantType('(u)'), Gio.DBusCallFlags.NONE, -1, null);
  return (reply.deepUnpack() as [number])[0];
}

function trusted(appId: string): boolean {
  return ((global as unknown as Shell.Global).context as TrustingContext).is_app_trusted(appId);
}

function inUntrustedFlatpak(pid: number): boolean {
  let contents: Uint8Array;
  try {
    [, contents] = Gio.File.new_for_path(`/proc/${pid}/root/.flatpak-info`).load_contents(null);
  } catch (error) {
    return !(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND));
  }
  try {
    const info = new GLib.KeyFile();
    info.load_from_bytes(new GLib.Bytes(contents), GLib.KeyFileFlags.NONE);
    return !trusted(info.get_string('Application', 'name'));
  } catch {
    return true;
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
  return inUntrustedFlatpak(pid) || inSnap(pid);
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
