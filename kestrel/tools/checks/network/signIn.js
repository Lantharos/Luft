import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {LuftApp, sabineService} from '../lib/luftApp.js';
import {firstLine, gjs, scratch, spawn, stop} from '../lib/processes.js';
import {waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('network sign-in');
const PAGE_COLOR = '#f2e8d8';
const FULL = 4;
const CLOSE_TIMEOUT = 5000;
const PAGE_TIMEOUT = 15000;
const NETWORK_MANAGER = ['org.freedesktop.NetworkManager', '/com/lantharos/KestrelChecks/NetworkManager', 'com.lantharos.KestrelChecks.NetworkManager'];
const PORTAL_PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>Harbor Hotel</title></head>
<body style="margin:0;height:100vh;display:grid;place-items:center;background:${PAGE_COLOR};font:16px sans-serif;color:#3a2e1f">
<form method="post" action="/"><h1>Welcome to Harbor Hotel</h1><p>Enter your room number to get online.</p>
<input name="room" placeholder="Room"> <button>Connect</button></form></body></html>`;

function systemBus() {
  return Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
}

function control(connection, method, parameters = null, replyType = null) {
  return call(...NETWORK_MANAGER, method, parameters, replyType, {connection});
}

async function owned(connection) {
  const reply = await call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', ['org.freedesktop.NetworkManager']), '(b)', {connection});
  return reply.deepUnpack()[0];
}

async function startPortal(folder) {
  GLib.mkdir_with_parents(folder, 0o700);
  GLib.file_set_contents(`${folder}/index.html`, PORTAL_PAGE);
  const server = spawn(['python3', '-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', folder],
    {flags: Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE});
  const [, port] = (await firstLine(server)).match(/ port (\d+) /);
  return {server, url: `http://127.0.0.1:${port}/`};
}

export async function run() {
  const folder = scratch('signin-portal');
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  const bus = systemBus();
  const networkManager = gjs('system/networkManager.js', [], {env: {DBUS_SYSTEM_BUS_ADDRESS: GLib.getenv('KESTREL_SYSTEM_BUS')}});
  const portal = await startPortal(folder);
  await sabineService();
  try {
    await waitUntil(() => owned(bus), 'the NetworkManager stand-in starts');
    styles.set_string('color-scheme', 'prefer-dark');
    const app = new LuftApp('signin', [`kestrel-signin:?network=${encodeURIComponent('Harbor Hotel')}&url=${encodeURIComponent(portal.url)}`]);
    await app.open();
    const shows = frame => frame.share([PAGE_COLOR], 3) > 0.5;
    await app.waitUntil(async () => shows(await app.frame()), 'the sign-in page loads', PAGE_TIMEOUT);
    const dark = await app.settle(shows);
    dark.save('signin-dark');
    require(shows(dark), 'the network’s sign-in page opens in its own window');
    styles.set_string('color-scheme', 'prefer-light');
    const light = await app.settle(frame => !frame.same(dark) && shows(frame));
    light.save('signin-light');
    require(!light.looksLike(dark), 'the window follows the light style around the page');
    await eventually(async () => (await control(bus, 'Checks', null, '(u)')).deepUnpack()[0] > 0,
      'loading the page asks NetworkManager to check the connection');
    await control(bus, 'SetConnectivity', new GLib.Variant('(u)', [FULL]));
    await eventually(() => !app.window.get_compositor_private(), 'the window closes once NetworkManager reports full connectivity');
    await app.finished(CLOSE_TIMEOUT);
  } finally {
    styles.set_string('color-scheme', scheme);
    await stop(portal.server);
    await stop(networkManager);
    bus.close_sync(null);
    await spawn(['rm', '-rf', folder]).exited;
  }
}
