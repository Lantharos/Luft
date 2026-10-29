import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {failureOf} from '../lib/errors.js';
import {withFullAccess} from '../lib/access/permissions.js';
import {call, ownName, privateConnection, subscribe} from '../lib/dbus.js';
import {fixture, gjs, outcome, spawn, stop, waitForWindow} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {SANDBOXED_APP, bubblewrapped, inAppScope, onSessionBus, sandboxedApp} from '../lib/access/sandbox.js';
import {openApp} from '../apps/lib/apps.js';

const {require, eventually} = checks('sandbox');
const MANAGER = ['/org/gnome/SessionManager', 'org.gnome.SessionManager'] as const;
const SCREEN_SAVER = ['/org/gnome/ScreenSaver', 'org.gnome.ScreenSaver'] as const;
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const ACCESS_DENIED = 'org.freedesktop.DBus.Error.AccessDenied';
const NOT_IN_INITIALIZATION = 'org.gnome.SessionManager.NotInInitialization';
const NO_CONFIRMATION = 1;
const SCREENCAST_SERVICE = 'com.lantharos.Kestrel.Screencast';
const PASSKEYS = ['/com/lantharos/Kestrel/Passkeys', 'com.lantharos.Kestrel.Passkeys1'] as const;
const PASSKEYS_AGENT = 'com.lantharos.Passkeys';
const SETTINGS_APP = 'com.lantharos.settings';
const PRELOADED = 'libm.so.6';
const NAMED_CLIENT = fixture('clients', 'wayland', 'blurClient.py');

type SandboxedApp = Awaited<ReturnType<typeof sandboxedApp>>;
type ShortcutsDialog = Meta.InhibitShortcutsDialog & GObject.SignalMethods<Meta.InhibitShortcutsDialog, Meta.InhibitShortcutsDialog.SignalSignatures>;

const shortcutsDialogFor = (window: Meta.Window) =>
  global.window_manager.emit('create-inhibit-shortcuts-dialog', window) as unknown as ShortcutsDialog;

const gdbus = (dest: string, [path, iface]: readonly [string, string], method: string, ...args: string[]) =>
  ['gdbus', 'call', '--session', '--dest', dest, '--object-path', path, '--method', `${iface}.${method}`, ...args];

async function failure(reply: Promise<unknown>) {
  try {
    await reply;
    return null;
  } catch (error) {
    const failed = failureOf(error);
    return failed instanceof GLib.Error ? Gio.DBusError.get_remote_error(failed) ?? failed.message : failed.message;
  }
}

const portal = (app: SandboxedApp, iface: string, method: string, parameters: GLib.Variant) => app.call(PORTAL_PATH, `org.freedesktop.impl.portal.${iface}`, method, parameters);

async function checkSessionManager() {
  const player = await sandboxedApp('org.freedesktop.ScreenSaver');
  try {
    require(await failure(player.call(...MANAGER, 'Setenv', new GLib.Variant('(ss)', ['LD_PRELOAD', '/tmp/payload.so']))) === ACCESS_DENIED,
      'sandboxed apps cannot change the environment of the session');
    require(await failure(call('org.gnome.SessionManager', ...MANAGER, 'Setenv', new GLib.Variant('(ss)', ['KESTREL_LATE', '1']))) === NOT_IN_INITIALIZATION,
      'the session environment is settled once Kestrel has started');
    const ended: string[] = [];
    const unsubscribe = subscribe({iface: 'org.gnome.SessionManager', member: 'SessionOver'}, signal => ended.push(signal));
    try {
      await player.call(...MANAGER, 'Logout', new GLib.Variant('(u)', [NO_CONFIRMATION]));
      await eventually(() => Main.modalCount > 0, 'sandboxed apps that log out ask first');
      await call(Gio.DBus.session.get_unique_name()!, `${MANAGER[0]}/EndSessionDialog`, `${MANAGER[1]}.EndSessionDialog`, 'Close');
      await eventually(() => Main.modalCount === 0, 'cancelling keeps the session running');
      require(!ended.length, 'a sandboxed app cannot end the session on its own');
    } finally {
      unsubscribe();
    }
  } finally {
    await player.close();
  }
}

async function checkPortalBackend(app: SandboxedApp) {
  require(await failure(portal(app, 'Settings', 'ReadAll', new GLib.Variant('(as)', [[]]))) === ACCESS_DENIED,
    'only the desktop portal can read portal settings from Kestrel');
  require(await failure(portal(app, 'ScreenCast', 'CreateSession', new GLib.Variant('(oosa{sv})',
    ['/org/freedesktop/portal/desktop/request/sandbox/cast', '/org/freedesktop/portal/desktop/session/sandbox/cast', '', {}]))) === ACCESS_DENIED,
  'apps cannot start screen sharing without the desktop portal');
  require(await failure(portal(app, 'RemoteDesktop', 'NotifyKeyboardKeysym', new GLib.Variant('(oa{sv}iu)',
    ['/org/freedesktop/portal/desktop/session/sandbox/control', {}, 0x61, 1]))) === ACCESS_DENIED,
  'apps cannot type into a remote control session without the desktop portal');
}

async function checkShellServices(app: SandboxedApp) {
  const denied = async (path: string, iface: string, method: string, parameters: GLib.Variant | null, label: string) =>
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

async function checkLockScreen(app: SandboxedApp) {
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
      new GLib.Variant('(ss)', ['org.kde.StatusNotifierWatcher', 'ProtocolVersion']), '(v)')).recursiveUnpack<[number]>();
    require(version === 0, 'apps allowed to show tray icons reach the tray');
    require(await failure(app.call('/org/gnome/Mutter/RemoteDesktop', 'org.gnome.Mutter.RemoteDesktop', 'CreateSession', null, '(o)')) !== null,
      'apps allowed to show tray icons cannot control the computer');
    require(await failure(app.call(...SCREEN_SAVER, 'GetActive', null, '(b)')) !== null,
      'apps allowed to show tray icons reach nothing else in Kestrel');
  } finally {
    await app.close();
  }
}

async function checkMutter() {
  const app = await sandboxedApp('org.gnome.Shell');
  const denied = async (path: string, iface: string, method: string, parameters: GLib.Variant | null, label: string) =>
    require(await failure(app.call(path, iface, method, parameters)) === ACCESS_DENIED, label);
  try {
    await denied('/org/gnome/Mutter/RemoteDesktop', 'org.gnome.Mutter.RemoteDesktop', 'CreateSession', null,
      'sandboxed apps cannot start remote control through Kestrel\'s names');
    await denied('/org/gnome/Mutter/ScreenCast', 'org.gnome.Mutter.ScreenCast', 'CreateSession', new GLib.Variant('(a{sv})', [{}]),
      'sandboxed apps cannot record the screen through Kestrel\'s names');
    await denied('/org/gnome/Mutter/InputCapture', 'org.gnome.Mutter.InputCapture', 'CreateSession', new GLib.Variant('(u)', [1]),
      'sandboxed apps cannot capture input through Kestrel\'s names');
    await denied('/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', 'ApplyMonitorsConfig',
      new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [0, 0, [], {}]), 'sandboxed apps cannot rearrange displays');
    await denied('/org/gnome/Mutter/DisplayConfig', 'org.freedesktop.DBus.Properties', 'Set',
      new GLib.Variant('(ssv)', ['org.gnome.Mutter.DisplayConfig', 'PowerSaveMode', new GLib.Variant('i', 0)]), 'sandboxed apps cannot turn displays off');
    require(await failure(app.call('/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', 'GetCurrentState')) === null,
      'sandboxed apps can still read the display layout');
  } finally {
    await app.close();
  }
}

async function checkScreencastImpostor() {
  const app = await sandboxedApp('org.gnome.Shell', {own: SCREENCAST_SERVICE});
  try {
    await eventually(() => ownName(app.connection, SCREENCAST_SERVICE),
      'a sandboxed app can take the name of Kestrel\'s screencast service once the service quits when idle', 10000);
    require(await failure(app.call('/org/gnome/Mutter/ScreenCast', 'org.gnome.Mutter.ScreenCast', 'CreateSession', new GLib.Variant('(a{sv})', [{}]))) === ACCESS_DENIED,
      'a sandboxed app with the screencast service\'s name still cannot record the screen');
  } finally {
    await app.close();
  }
}

async function refusedAsSandboxed(reply: Promise<unknown>) {
  try {
    await reply;
    return false;
  } catch (error) {
    return failureOf(error).message.includes('Sandboxed apps');
  }
}

async function checkHostImpostors() {
  const setenv = gdbus('org.gnome.SessionManager', MANAGER, 'Setenv', 'LD_PRELOAD', '/tmp/payload.so');
  const dim = gdbus('org.gnome.Shell', ['/com/lantharos/Kestrel/Brightness', 'com.lantharos.Kestrel.Brightness'], 'SetDimming', 'false');
  const scoped = await outcome(inAppScope(SETTINGS_APP, [...onSessionBus(SANDBOXED_APP), ...setenv]));
  require(scoped.stderr.includes(ACCESS_DENIED), 'a sandboxed app in a scope named after Settings still cannot change the session environment');
  const dimming = await outcome(inAppScope(SETTINGS_APP, [...onSessionBus(SANDBOXED_APP), ...dim]));
  require(dimming.stderr.includes('Sandboxed apps'), 'a sandboxed app in a scope named after Settings is still refused by Kestrel\'s services');

  const preloaded = await outcome(inAppScope(PASSKEYS_AGENT, gdbus('com.lantharos.Kestrel.Passkeys', PASSKEYS, 'Open', '{}')), {env: {LD_PRELOAD: PRELOADED}});
  require(preloaded.stderr.includes('Only Luft Passkeys'), 'a scope named after Luft Passkeys and a preloaded library do not pass as Luft Passkeys');
  const agent = privateConnection();
  try {
    require(await ownName(agent, PASSKEYS_AGENT), 'a program outside a sandbox can take Luft Passkeys\' name while it is free');
    const asked = await failure(call('com.lantharos.Kestrel.Passkeys', ...PASSKEYS, 'Open', new GLib.Variant('(a{sv})', [{}]), null, {connection: agent}));
    require(asked === 'org.freedesktop.DBus.Error.InvalidArgs', 'the owner of Luft Passkeys\' name may ask about passkeys');
  } finally {
    agent.close_sync(null);
  }
}

async function checkFullAccess() {
  const app = await sandboxedApp('org.gnome.Shell');
  const manager = await sandboxedApp('org.gnome.SessionManager');
  const setenv = () => failure(manager.call(...MANAGER, 'Setenv', new GLib.Variant('(ss)', ['KESTREL_LATE', '1'])));
  const dim = () => refusedAsSandboxed(app.call('/com/lantharos/Kestrel/Brightness', 'com.lantharos.Kestrel.Brightness', 'SetDimming', new GLib.Variant('(b)', [false])));
  const arrange = () => refusedAsSandboxed(app.call('/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', 'ApplyMonitorsConfig',
    new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [0, 0, [], {}])));
  try {
    await withFullAccess(SANDBOXED_APP, async () => {
      require(!await dim(), 'apps with full access use Kestrel\'s services like apps outside a sandbox');
      require(!await arrange(), 'apps with full access reach display settings like apps outside a sandbox');
      require(await setenv() === NOT_IN_INITIALIZATION, 'the session manager treats apps with full access like apps outside a sandbox');
    });
    require(await dim() && await arrange(), 'taking full access away refuses the app again');
    require(await setenv() === ACCESS_DENIED, 'the session manager refuses the app again once full access is gone');
  } finally {
    await Promise.all([app.close(), manager.close()]);
  }
}

const shortcutsPrompt = () => descendants(global.stage).filter(actor => actor.mapped).map(textOf).find(text => text?.includes('wants to inhibit shortcuts'))?.replace(/[\u2068\u2069]/g, '') ?? null;

async function shortcutsAnswer(window: Meta.Window) {
  const dialog = shortcutsDialogFor(window);
  const answers: Meta.InhibitShortcutsDialogResponse[] = [];
  dialog.connect('response', (_dialog, response) => answers.push(response));
  dialog.show();
  await eventually(() => answers.length > 0 || Main.modalCount > 0, `Kestrel answers or asks when ${window.get_title()} inhibits shortcuts`);
  const prompt = shortcutsPrompt();
  dialog.hide();
  await eventually(() => Main.modalCount === 0 && !shortcutsPrompt(), 'the shortcuts prompt closes');
  return answers.at(0) ?? prompt;
}

async function checkWindowImpostors() {
  const x11 = gjs('clients/x11/x11Window.js', ['Kestrel impostor: X11', '#2f5d8a', '', SETTINGS_APP]);
  const unsandboxed = spawn(['python3', NAMED_CLIENT, 'Kestrel impostor: Wayland', '320', '200']);
  const sandboxed = spawn([...bubblewrapped(SANDBOXED_APP), 'python3', NAMED_CLIENT, 'Kestrel impostor: sandboxed', '320', '200']);
  try {
    const x11Window = await waitForWindow('Kestrel impostor: X11');
    require(x11Window.get_wm_class() === SETTINGS_APP, 'an X11 window can name itself after Settings');
    const x11Prompt = await shortcutsAnswer(x11Window);
    require(typeof x11Prompt === 'string', 'an X11 window named after Settings asks before it inhibits shortcuts');
    require(x11Prompt === 'The app gjs-console wants to inhibit shortcuts', `the prompt names the program behind the X11 window, not the name it chose (${x11Prompt})`);
    const waylandPrompt = await shortcutsAnswer(await waitForWindow('Kestrel impostor: Wayland'));
    require(typeof waylandPrompt === 'string', 'a program outside Luft\'s apps with a Luft app ID asks before it inhibits shortcuts');
    require(typeof waylandPrompt === 'string' && waylandPrompt.startsWith('The app python'), `the prompt names the program, not its app ID (${waylandPrompt})`);
    require(await shortcutsAnswer(await waitForWindow('Kestrel impostor: sandboxed')) === `The app ${SANDBOXED_APP} wants to inhibit shortcuts`,
      'a sandboxed app with a Luft app ID asks before it inhibits shortcuts, named by its sandbox');
  } finally {
    await Promise.all([stop(x11), stop(unsandboxed), stop(sandboxed)]);
  }
  const settings = await openApp('settings');
  try {
    require(await shortcutsAnswer(settings.window) === Meta.InhibitShortcutsDialogResponse.ALLOW, 'Settings inhibits shortcuts without asking');
  } finally {
    await settings.close();
  }
}

export async function run() {
  await checkSessionManager();
  await checkShellConnection();
  await checkScreenSaver();
  await checkTray();
  await checkMutter();
  await checkFullAccess();
  await checkHostImpostors();
  await checkWindowImpostors();
  await checkScreencastImpostor();
}
