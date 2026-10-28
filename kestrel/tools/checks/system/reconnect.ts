import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {launchDetached} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {scratch, windows, windowShown} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';

const {require, eventually} = checks('reconnect');
const STATE = scratch('reconnect.json');
const REQUEUED = '0000-system:reconnect';
const RETURN_TIMEOUT = 30000;
const NOTED_AFTER = 1500;
const TOLERANCE = 2;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SavedApp {
  name: string;
  pid: number;
  client: number;
  log: string | null;
  frame: Box;
  workspace: number;
  maximized: boolean;
}

interface Saved {
  kestrel: number;
  apps: SavedApp[];
}

const ownPid = () => Gio.Credentials.new().get_unix_pid();
const windowOf = (client: number) => windows().find(window => window.get_pid() === client) ?? null;
const boxOf = (window: Meta.Window): Box => {
  const {x, y, width, height} = window.get_frame_rect();
  return {x, y, width, height};
};
const near = (a: Box, b: Box) => (['x', 'y', 'width', 'height'] as const).every(side => Math.abs(a[side] - b[side]) <= TOLERANCE);
const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

function launchQt(): number | null {
  const program = GLib.getenv('KESTREL_QT_APP');
  if (!program) return null;
  const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
  launcher.setenv('QT_WAYLAND_RECONNECT', '1', true);
  launcher.setenv('QT_QPA_PLATFORMTHEME', 'gnome', true);
  launcher.setenv('QT_QPA_PLATFORM', 'wayland', true);
  return Number(launcher.spawnv([program]).get_identifier());
}

function arrange(rover: Meta.Window, settings: Meta.Window) {
  const manager = global.workspace_manager;
  if (manager.n_workspaces < 2) manager.append_new_workspace(false, global.get_current_time());
  rover.change_workspace_by_index(1, false);
  rover.move_resize_frame(true, 160, 120, 900, 560);
  settings.maximize();
}

function crash(pid: number) {
  Gio.Subprocess.new(['sh', '-c', `kill -SEGV ${pid}; sleep 1; kill -SEGV ${pid}`], Gio.SubprocessFlags.NONE);
}

async function prepare() {
  const started: {name: string; log: string | null; pid: number; owns: (window: Meta.Window) => boolean}[] = ['rover', 'settings'].map(name => {
    const log = scratch(`${name}-reconnect.log`);
    return {name, log, pid: launchDetached(name, log), owns: window => window.get_wm_class() === `com.lantharos.${name}`};
  });
  const qt = launchQt();
  if (qt) started.push({name: 'the Qt app', log: null, pid: qt, owns: window => window.get_pid() === qt});
  const shown = await eventually(() => {
    const found = started.map(app => windows().find(window => app.owns(window) && windowShown(window)));
    return found.every(Boolean) && found as Meta.Window[];
  }, 'the apps open their windows', RETURN_TIMEOUT);
  arrange(shown[0], shown[1]);
  await settled();
  await pause(NOTED_AFTER);
  await capture('reconnect-before');
  await lock();
  const saved: Saved = {
    kestrel: ownPid(),
    apps: started.map(({name, log, pid}, index) => ({
      name, log, pid,
      client: shown[index].get_pid(),
      frame: boxOf(shown[index]),
      workspace: shown[index].get_workspace()?.index() ?? 0,
      maximized: shown[index].maximized_horizontally && shown[index].maximized_vertically,
    })),
  };
  GLib.file_set_contents(STATE, JSON.stringify(saved));
  GLib.file_set_contents(GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_QUEUE')!, REQUEUED]), '');
  crash(saved.kestrel);
  await new Promise(() => {});
}

function checkPage(app: SavedApp) {
  if (!app.log) return;
  const log = read(app.log);
  const lost = log.lastIndexOf('display.lost');
  require(lost >= 0 && log.includes('display.regained', lost), `${app.name} reconnects to the new Kestrel`);
  const after = log.slice(lost);
  require(!after.includes('browser.load_started') && !after.includes('browser exited'), `${app.name} keeps its page and browser`);
}

async function verify(saved: Saved) {
  require(ownPid() !== saved.kestrel, 'Kestrel starts again after it crashes');
  await eventually(() => Main.screenShield.locked, 'Kestrel comes back locked when it crashed locked');
  const returned: Meta.Window[] = [];
  for (const app of saved.apps)
    returned.push(await eventually(() => windowOf(app.client), `${app.name} reconnects with its window`, RETURN_TIMEOUT));
  await unlock();
  await settled();
  saved.apps.forEach((app, index) => {
    const window = returned[index];
    require(window.get_workspace()?.index() === app.workspace, `${app.name} comes back on its workspace`);
    const maximized = window.maximized_horizontally && window.maximized_vertically;
    require(maximized === app.maximized && (app.maximized || near(boxOf(window), app.frame)), `${app.name} comes back where it was`);
    checkPage(app);
  });
  await capture('reconnect-after');
  Gio.Subprocess.new(['kill', ...saved.apps.map(app => String(app.pid))], Gio.SubprocessFlags.NONE);
  await eventually(() => saved.apps.every(app => !windowOf(app.client)), 'the reconnected apps close');
  GLib.unlink(STATE);
}

export async function run() {
  if (GLib.file_test(STATE, GLib.FileTest.EXISTS)) await verify(JSON.parse(read(STATE)) as Saved);
  else await prepare();
}

export const timeout = 120000;
