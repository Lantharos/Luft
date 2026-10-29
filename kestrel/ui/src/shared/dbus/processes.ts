import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const decoder = new TextDecoder();

export function readProcFile(path: string): string | null {
  try {
    return decoder.decode(GLib.file_get_contents(path)[1]);
  } catch {
    return null;
  }
}

export function stealFd(fdList: Gio.UnixFDList | null, index: number): number | null {
  const fds = fdList?.steal_fds() ?? [];
  for (const [position, fd] of fds.entries())
    if (position !== index) GLib.close(fd);
  return index < fds.length ? fds[index] : null;
}

export class PidFd {
  constructor(readonly fd: number) {}

  get pid(): number | null {
    const pid = Number(/^Pid:\s*(-?\d+)$/m.exec(readProcFile(`/proc/self/fdinfo/${this.fd}`) ?? '')?.[1] ?? -1);
    return pid > 0 ? pid : null;
  }

  close(): void {
    GLib.close(this.fd);
  }
}

async function processOf(connection: Gio.DBusConnection, name: string): Promise<PidFd | null> {
  const [reply, fds] = await connection.call_with_unix_fd_list('org.freedesktop.DBus', '/org/freedesktop/DBus',
    'org.freedesktop.DBus', 'GetConnectionCredentials', new GLib.Variant('(s)', [name]), new GLib.VariantType('(a{sv})'),
    Gio.DBusCallFlags.NONE, -1, null, null);
  const [credentials] = reply.deepUnpack() as [Record<string, GLib.Variant>];
  const fd = credentials.ProcessFD ? stealFd(fds, credentials.ProcessFD.deepUnpack() as number) : null;
  return fd === null ? null : new PidFd(fd);
}

export const callerProcess = (invocation: Gio.DBusMethodInvocation) => processOf(invocation.get_connection(), invocation.get_sender()!);

export async function ownerProcess(name: string): Promise<PidFd | null> {
  await Gio.DBus.session.call(name, '/', 'org.freedesktop.DBus.Peer', 'Ping', null, null, Gio.DBusCallFlags.NONE, -1, null);
  return processOf(Gio.DBus.session, name);
}
