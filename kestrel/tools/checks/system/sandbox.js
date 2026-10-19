import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {sandboxedApp} from './lib/sandbox.js';

const {require, eventually} = checks('sandbox');
const MANAGER = ['/org/gnome/SessionManager', 'org.gnome.SessionManager'];
const SCREEN_SAVER = ['/org/gnome/ScreenSaver', 'org.gnome.ScreenSaver'];
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const ACCESS_DENIED = 'org.freedesktop.DBus.Error.AccessDenied';
const NOT_IN_INITIALIZATION = 'org.gnome.SessionManager.NotInInitialization';
const NO_CONFIRMATION = 1;

async function failure(reply) {
  try {
    await reply;
    return null;
  } catch (error) {
    return Gio.DBusError.get_remote_error(error) ?? error.message;
  }
}

const portal = (app, iface, method, parameters) => app.call(PORTAL_PATH, `org.freedesktop.impl.portal.${iface}`, method, parameters);

async function checkSessionManager() {
  const player = await sandboxedApp('org.freedesktop.ScreenSaver');
  try {
    require(await failure(player.call(...MANAGER, 'Setenv', new GLib.Variant('(ss)', ['LD_PRELOAD', '/tmp/payload.so']))) === ACCESS_DENIED,
      'sandboxed apps cannot change the environment of the session');
    require(await failure(call('org.gnome.SessionManager', ...MANAGER, 'Setenv', new GLib.Variant('(ss)', ['KESTREL_LATE', '1']))) === NOT_IN_INITIALIZATION,
      'the session environment is settled once Kestrel has started');
    const ended = [];
    const unsubscribe = subscribe({iface: 'org.gnome.SessionManager', member: 'SessionOver'}, signal => ended.push(signal));
    try {
      await player.call(...MANAGER, 'Logout', new GLib.Variant('(u)', [NO_CONFIRMATION]));
      await eventually(() => Main.modalCount > 0, 'sandboxed apps that log out ask first');
      await call(Gio.DBus.session.get_unique_name(), `${MANAGER[0]}/EndSessionDialog`, `${MANAGER[1]}.EndSessionDialog`, 'Close');
      await eventually(() => Main.modalCount === 0, 'cancelling keeps the session running');
      require(!ended.length, 'a sandboxed app cannot end the session on its own');
    } finally {
      unsubscribe();
    }
  } finally {
    await player.close();
  }
}

async function checkPortalBackend(app) {
  require(await failure(portal(app, 'Settings', 'ReadAll', new GLib.Variant('(as)', [[]]))) === ACCESS_DENIED,
    'only the desktop portal can read portal settings from Kestrel');
  require(await failure(portal(app, 'ScreenCast', 'CreateSession', new GLib.Variant('(oosa{sv})',
    ['/org/freedesktop/portal/desktop/request/sandbox/cast', '/org/freedesktop/portal/desktop/session/sandbox/cast', '', {}]))) === ACCESS_DENIED,
  'apps cannot start screen sharing without the desktop portal');
  require(await failure(portal(app, 'RemoteDesktop', 'NotifyKeyboardKeysym', new GLib.Variant('(oa{sv}iu)',
    ['/org/freedesktop/portal/desktop/session/sandbox/control', {}, 0x61, 1]))) === ACCESS_DENIED,
  'apps cannot type into a remote control session without the desktop portal');
}

async function checkShellServices(app) {
  const denied = async (path, iface, method, parameters, label) =>
    require(await failure(app.call(path, iface, method, parameters)) === ACCESS_DENIED, label);
  require(`${await failure(app.call('/com/lantharos/Kestrel/Peek', 'com.lantharos.Kestrel.Peek', 'List', new GLib.Variant('(s)', ['']))) ?? ''}`.endsWith('Denied'),
    'sandboxed apps cannot see or use other windows through peek');
  await denied('/com/lantharos/Kestrel/Passkeys', 'com.lantharos.Kestrel.Passkeys1', 'Open', new GLib.Variant('(a{sv})', [{}]),
    'sandboxed apps cannot open passkey prompts');
  await denied('/com/lantharos/Kestrel/Brightness', 'com.lantharos.Kestrel.Brightness', 'SetDimming', new GLib.Variant('(b)', [true]),
    'sandboxed apps cannot dim the screen');
  await denied('/org/gtk/Notifications', 'org.gtk.Notifications', 'AddNotification',
    new GLib.Variant('(ssa{sv})', ['com.obsproject.Studio', 'impostor', {title: new GLib.Variant('s', 'Recording stopped')}]),
    'sandboxed apps cannot show notifications in the name of other apps');
  await denied('/org/gtk/MountOperationHandler', 'org.Gtk.MountOperationHandler', 'AskPassword',
    new GLib.Variant('(sssssu)', ['impostor', 'Enter your password', '', '', '', 0]), 'sandboxed apps cannot ask for passwords as the system');
  await denied(`${MANAGER[0]}/EndSessionDialog`, `${MANAGER[1]}.EndSessionDialog`, 'Open', new GLib.Variant('(uuuao)', [0, 0, 60, []]),
    'sandboxed apps cannot open the dialog that ends the session');
  require(Main.modalCount === 0, 'no system dialog opened for a sandboxed app');
}

async function checkLockScreen(app) {
  await lock();
  try {
    require(await failure(app.call(...SCREEN_SAVER, 'SetActive', new GLib.Variant('(b)', [false]))) === ACCESS_DENIED,
      'turning the screen saver off does not unlock the screen');
    await pause(500);
    require(Main.screenShield.locked, 'the screen stays locked');
  } finally {
    await unlock();
  }
}

async function checkShellConnection() {
  const app = await sandboxedApp('org.gnome.Shell');
  try {
    await checkPortalBackend(app);
    await checkShellServices(app);
  } finally {
    await app.close();
  }
}

async function checkScreenSaver() {
  const app = await sandboxedApp('org.gnome.ScreenSaver');
  try {
    await checkLockScreen(app);
    require(await failure(app.call('/org/gnome/Mutter/RemoteDesktop', 'org.gnome.Mutter.RemoteDesktop', 'CreateSession', null, '(o)')) !== null,
      'apps allowed to use the screen saver cannot control the computer');
  } finally {
    await app.close();
  }
}

async function checkTray() {
  const app = await sandboxedApp('org.kde.StatusNotifierWatcher');
  try {
    const [version] = (await app.call('/StatusNotifierWatcher', 'org.freedesktop.DBus.Properties', 'Get',
      new GLib.Variant('(ss)', ['org.kde.StatusNotifierWatcher', 'ProtocolVersion']), '(v)')).recursiveUnpack();
    require(version === 0, 'apps allowed to show tray icons reach the tray');
    require(await failure(app.call('/org/gnome/Mutter/RemoteDesktop', 'org.gnome.Mutter.RemoteDesktop', 'CreateSession', null, '(o)')) !== null,
      'apps allowed to show tray icons cannot control the computer');
    require(await failure(app.call(...SCREEN_SAVER, 'GetActive', null, '(b)')) !== null,
      'apps allowed to show tray icons reach nothing else in Kestrel');
  } finally {
    await app.close();
  }
}

export async function run() {
  await checkSessionManager();
  await checkShellConnection();
  await checkScreenSaver();
  await checkTray();
}
