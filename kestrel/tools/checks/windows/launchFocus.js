import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {firstStyled, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {centerOf, click, rest} from '../lib/input/input.js';
import {LuftApp, sabineService} from '../lib/apps/luftApp.js';
import {fixture, firstLine, gjs, spawn, waitForWindow} from '../lib/processes.js';
import {pause, waitUntil} from '../lib/wait.js';

const {require, eventually} = checks('launch focus');
const DELAY = 2000;
const BEFORE_INTERACTION = 300;
const SETTLE = 500;
const NOTICE_TIMEOUT = 15000;
const SABINE_TIMEOUT = 30000;
const NO_LAUNCH_TOKEN = {XDG_ACTIVATION_TOKEN: null, DESKTOP_STARTUP_ID: null};

function install(name, backend) {
  const id = `com.lantharos.Kestrel.LateWindow${name}`;
  const title = `Kestrel late window: ${name}`;
  const desktop = GLib.build_filenamev([GLib.get_user_data_dir(), 'applications', `${id}.desktop`]);
  const command = ['env', `GDK_BACKEND=${backend}`, 'gjs', '-m', fixture('clients', 'windows', 'lateWindow.js'), id, `'${title}'`, `${DELAY}`].join(' ');
  GLib.mkdir_with_parents(GLib.path_get_dirname(desktop), 0o755);
  GLib.file_set_contents(desktop, `[Desktop Entry]\nType=Application\nName=Late ${name}\nExec=${command}\nStartupNotify=true\nStartupWMClass=${id}\n`);
  return {id: `${id}.desktop`, name, title, remove: () => Gio.File.new_for_path(desktop).delete(null)};
}

async function installed(entries) {
  const apps = Shell.AppSystem.get_default();
  await waitUntil(() => entries.every(entry => (entry.app = apps.lookup_app(entry.id))), 'Kestrel notices the late window apps', NOTICE_TIMEOUT);
  return entries;
}

const onTop = (window, other) => global.display.sort_windows_by_stacking([window, other]).at(-1) === window;
const taskbarButton = window => named(`kestrel-app-${Shell.WindowTracker.get_default().get_window_app(window).id}`, named('kestrel-panel'));
const asksForAttention = window => !!firstStyled('kestrel-task-attention', taskbarButton(window))?.visible;

async function focus(window) {
  window.activate(global.get_current_time());
  await waitUntil(() => window.has_focus(), `${window.get_title()} takes focus`);
  await pause(SETTLE);
}

async function close(window) {
  const closed = new Promise(resolve => window.connect('unmanaged', resolve));
  window.delete(global.get_current_time());
  await closed;
}

async function checkStaysBehind(late, current, how) {
  await pause(SETTLE);
  require(current.has_focus() && !late.has_focus(), `a window ${how} does not take focus once you use another window`);
  require(onTop(current, late), `a window ${how} opens behind the window you are using`);
  require(late.demands_attention, `a window ${how} asks for attention instead`);
  await eventually(() => asksForAttention(late), `the taskbar shows that a window ${how} wants attention`);
}

async function checkTakesFocus(late, current, how) {
  await eventually(() => late.has_focus(), `a window ${how} takes focus when nothing else was used meanwhile`);
  require(onTop(late, current), `a window ${how} opens on top when nothing else was used meanwhile`);
  require(!late.demands_attention, `a window ${how} does not ask for attention when it takes focus`);
}

async function useMeanwhile(current) {
  await pause(BEFORE_INTERACTION);
  click(centerOf(current.get_compositor_private()));
  rest();
}

async function launched(current, entry, interact) {
  await focus(current);
  entry.app.activate();
  if (interact) await useMeanwhile(current);
  return waitForWindow(entry.title);
}

async function checkLaunches(current, entry) {
  const how = `launched from Kestrel (${entry.name})`;
  const late = await launched(current, entry, true);
  await checkStaysBehind(late, current, how);
  taskbarButton(late).emit('clicked', Clutter.BUTTON_PRIMARY);
  await eventually(() => late.has_focus() && onTop(late, current), 'clicking its taskbar entry brings the waiting window forward');
  await eventually(() => !late.demands_attention && !asksForAttention(late), 'the taskbar stops asking for attention once the window is used');
  await close(late);

  const focused = await launched(current, entry, false);
  await checkTakesFocus(focused, current, how);
  await close(focused);
}

const startWithoutLaunch = (title, options = {}) =>
  gjs('clients/windows/lateWindow.js', ['com.lantharos.Kestrel.LateWindowAutostart', title, `${DELAY}`], {...options, env: NO_LAUNCH_TOKEN});

async function checkStartedWithoutLaunch(current) {
  const how = 'started without Kestrel, like an autostart app';
  const title = 'Kestrel late window: autostart';
  await focus(current);
  await firstLine(startWithoutLaunch(title, {flags: Gio.SubprocessFlags.STDOUT_PIPE}));
  await useMeanwhile(current);
  const late = await waitForWindow(title);
  await checkStaysBehind(late, current, how);
  await close(late);

  await focus(current);
  startWithoutLaunch(title);
  const focused = await waitForWindow(title);
  await checkTakesFocus(focused, current, how);
  await close(focused);
}

function launchToken(name) {
  const entry = new GLib.KeyFile();
  const contents = `[Desktop Entry]\nType=Application\nName=${name}\nExec=${name}\n`;
  entry.load_from_data(contents, contents.length, GLib.KeyFileFlags.NONE);
  return global.create_app_launch_context(0, -1).get_startup_notify_id(Gio.DesktopAppInfo.new_from_keyfile(entry), []);
}

async function checkSabineLaunch(current, interact) {
  const how = 'of a Sabine app launched from Kestrel';
  await focus(current);
  const token = launchToken('Barometer');
  const app = new LuftApp('barometer', [], {XDG_ACTIVATION_TOKEN: token, DESKTOP_STARTUP_ID: token});
  try {
    if (interact) await useMeanwhile(current);
    const window = await waitForWindow(window => window.get_wm_class() === app.id, 'Barometer opens', SABINE_TIMEOUT);
    if (interact) await checkStaysBehind(window, current, how);
    else await checkTakesFocus(window, current, how);
  } finally {
    await app.close();
  }
}

export async function run() {
  const entries = [install('Wayland', 'wayland'), install('X11', 'x11')];
  try {
    spawn(['gjs', '-m', fixture('clients', 'windows', 'window.js')]);
    const current = await waitForWindow('Kestrel window check');
    for (const entry of await installed(entries)) await checkLaunches(current, entry);
    await checkStartedWithoutLaunch(current);
    await sabineService();
    await checkSabineLaunch(current, true);
    await checkSabineLaunch(current, false);
  } finally {
    entries.forEach(entry => entry.remove());
  }
}
