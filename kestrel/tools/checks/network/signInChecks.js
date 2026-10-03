import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {LuftApp, startSabineService, waitFor} from '../apps/luftApp.js';
import {checker} from '../portal/backend.js';

const require = checker('network sign-in');
const REPOSITORY = GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]), '..', '..', '..', '..']);
const NETWORK_MANAGER = GLib.build_filenamev([REPOSITORY, 'kestrel/tools/fixtures/networkManager.js']);
const PORT = 18480;
const PAGE_COLOR = '#f2e8d8';
const FULL = 4;
const PORTAL_PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>Harbor Hotel</title></head>
<body style="margin:0;height:100vh;display:grid;place-items:center;background:${PAGE_COLOR};font:16px sans-serif;color:#3a2e1f">
<form method="post" action="/"><h1>Welcome to Harbor Hotel</h1><p>Enter your room number to get online.</p>
<input name="room" placeholder="Room"> <button>Connect</button></form></body></html>`;

function systemBus() {
  return Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

function control(bus, method, parameters, replyType) {
  return bus.call_sync('org.freedesktop.NetworkManager', '/com/lantharos/KestrelChecks/NetworkManager',
    'com.lantharos.KestrelChecks.NetworkManager', method, parameters, replyType && new GLib.VariantType(replyType),
    Gio.DBusCallFlags.NONE, -1, null);
}

function owned(bus) {
  return bus.call_sync('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', ['org.freedesktop.NetworkManager']), new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, null).deepUnpack()[0];
}

function within(condition, milliseconds) {
  return waitFor(condition, milliseconds, () => '').then(() => true, () => false);
}

function answers(port) {
  try {
    new Gio.SocketClient().connect_to_host(`127.0.0.1:${port}`, port, null).close(null);
    return true;
  } catch {
    return false;
  }
}

function startNetworkManager() {
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
  launcher.setenv('DBUS_SYSTEM_BUS_ADDRESS', GLib.getenv('KESTREL_SYSTEM_BUS'), true);
  return launcher.spawnv(['gjs', '-m', NETWORK_MANAGER]);
}

function startPortal(scratch) {
  GLib.mkdir_with_parents(scratch, 0o700);
  GLib.file_set_contents(`${scratch}/index.html`, PORTAL_PAGE);
  return Gio.Subprocess.new(['python3', '-m', 'http.server', `${PORT}`, '--bind', '127.0.0.1', '--directory', scratch],
    Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE);
}

export async function checkNetworkSignIn({output}) {
  const scratch = GLib.build_filenamev([GLib.get_user_cache_dir(), 'signin-portal']);
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  const bus = systemBus();
  const networkManager = startNetworkManager();
  const portal = startPortal(scratch);
  const service = await startSabineService();
  try {
    await waitFor(() => owned(bus), 5000, () => 'The NetworkManager stand-in did not start');
    await waitFor(() => answers(PORT), 5000, () => 'The test portal did not start');
    styles.set_string('color-scheme', 'prefer-dark');
    const url = `http://127.0.0.1:${PORT}/`;
    const app = new LuftApp('signin', [`kestrel-signin:?network=${encodeURIComponent('Harbor Hotel')}&url=${encodeURIComponent(url)}`]);
    await app.open();
    const shows = frame => frame.share(PAGE_COLOR, 3) > 0.5;
    const dark = await app.settle(shows);
    dark.save(`${output}/signin-dark.png`);
    require(shows(dark), 'the network’s sign-in page opens in its own window');
    styles.set_string('color-scheme', 'prefer-light');
    const light = await app.settle(frame => !frame.same(dark) && shows(frame));
    light.save(`${output}/signin-light.png`);
    require(!light.looksLike(dark), 'the window follows the light style around the page');
    require(await within(() => control(bus, 'Checks', null, '(u)').deepUnpack()[0] > 0, 5000),
      'loading the page asks NetworkManager to check the connection');
    control(bus, 'SetConnectivity', new GLib.Variant('(u)', [FULL]), null);
    require(await within(() => app._exited, 5000), 'the window closes once NetworkManager reports full connectivity');
  } finally {
    styles.set_string('color-scheme', scheme);
    await service.stop();
    portal.force_exit();
    networkManager.force_exit();
    bus.close_sync(null);
    Gio.Subprocess.new(['rm', '-rf', scratch], Gio.SubprocessFlags.NONE).wait(null);
  }
}
