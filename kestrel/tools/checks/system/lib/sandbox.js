import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {scratch, spawn, stop} from '../../lib/processes.js';
import {waitUntil} from '../../lib/wait.js';

export const SANDBOXED_APP = 'com.lantharos.KestrelChecks.Sandboxed';

function sandboxRoot() {
  const root = scratch('kestrel-sandbox');
  GLib.mkdir_with_parents(root, 0o700);
  GLib.file_set_contents(GLib.build_filenamev([root, 'flatpak-info']), `[Application]\nname=${SANDBOXED_APP}\n`);
  return root;
}

function bubblewrap(root, socket, talk, own) {
  const runtime = GLib.get_user_runtime_dir();
  return [
    'bwrap', '--die-with-parent', '--unshare-pid',
    '--ro-bind', '/usr', '/usr', '--ro-bind', '/etc', '/etc',
    '--symlink', 'usr/bin', '/bin', '--symlink', 'usr/sbin', '/sbin', '--symlink', 'usr/lib', '/lib', '--symlink', 'usr/lib64', '/lib64',
    '--proc', '/proc', '--dev', '/dev', '--bind', '/tmp', '/tmp', '--bind', runtime, runtime, '--bind', root, root,
    '--ro-bind', GLib.build_filenamev([root, 'flatpak-info']), '/.flatpak-info',
    'xdg-dbus-proxy', GLib.getenv('DBUS_SESSION_BUS_ADDRESS'), socket, '--filter', `--talk=${talk}`,
    ...own ? [`--own=${own}`] : [],
  ];
}

export async function sandboxedApp(talk, {own = null} = {}) {
  const root = sandboxRoot();
  const socket = GLib.build_filenamev([root, `bus-${talk}`]);
  GLib.unlink(socket);
  const proxy = spawn(bubblewrap(root, socket, talk, own));
  await waitUntil(() => GLib.file_test(socket, GLib.FileTest.EXISTS), `a sandboxed app that may talk to ${talk} starts`, 10000);
  const connection = Gio.DBusConnection.new_for_address_sync(`unix:path=${socket}`,
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return {
    connection,
    call(path, iface, method, parameters = null, replyType = null) {
      return connection.call(talk, path, iface, method, parameters, replyType && new GLib.VariantType(replyType), Gio.DBusCallFlags.NONE, 5000, null);
    },
    async close() {
      connection.close_sync(null);
      await stop(proxy);
    },
  };
}
