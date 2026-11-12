import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {call} from '../../lib/dbus.js';

const PACKAGES = 'com.lantharos.Packages1';
const PACKAGES_PATH = '/com/lantharos/Packages1';
const GREETER = 'com.lantharos.Greeter1';
const CHECKS = 'com.lantharos.KestrelChecks';
const O_DIRECTORY = 0o200000;
const system = {connection: Gio.DBus.system};

export const unreviewedFolder = (id: string) => GLib.build_filenamev([GLib.getenv('KESTREL_UNREVIEWED_EXTENSIONS')!, id]);

export const setDeveloperTools = (on: boolean) =>
  call(GREETER, '/com/lantharos/Greeter1', GREETER, 'SetDeveloperTools', new GLib.Variant('(b)', [on]), null, system);

export async function installCopy(id: string, folder: string) {
  const fds = new Gio.UnixFDList();
  const fd = GLib.open(folder, O_DIRECTORY, 0);
  const handle = fds.append(fd);
  GLib.close(fd);
  await new Promise((resolve, reject) => Gio.DBus.system.call_with_unix_fd_list(PACKAGES, PACKAGES_PATH, PACKAGES, 'InstallUnreviewedExtension',
    new GLib.Variant('(sh)', [id, handle]), null, Gio.DBusCallFlags.NONE, -1, fds, null, (connection, result) => {
      try {
        resolve(connection!.call_with_unix_fd_list_finish(result));
      } catch (error) {
        reject(error as Error);
      }
    }));
}

export const allowFolder = (id: string, folder: string) =>
  call(PACKAGES, PACKAGES_PATH, PACKAGES, 'AllowExtensionFolder', new GLib.Variant('(ss)', [id, folder]), null, system);

export const removeUnreviewed = (id: string) =>
  call(PACKAGES, PACKAGES_PATH, PACKAGES, 'RemoveUnreviewedExtension', new GLib.Variant('(s)', [id]), null, system);

export async function packagesCalls(id: string): Promise<string[]> {
  const reply = await call(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null, '(as)', system);
  return reply.deepUnpack<[string[]]>()[0].filter(entry => entry.startsWith('Packages ') && entry.split(' ')[2] === id);
}

export async function refused(work: () => Promise<unknown>): Promise<string | null> {
  try {
    await work();
    return null;
  } catch (error) {
    return (error as Error).message;
  }
}
