import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';

import {launchDetached} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {scratch, windowShown} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {forgetCrashes} from '../extensions/lib/extensions.js';
import {install, NOTEBOOK, open, processesOf, quit, titled, uninstall, windowsOf} from './lib/apps.js';
import {boxOf, crashKestrel, maximized, near, phases, type Box} from './lib/signIn.js';

const {require, eventually} = checks('session restore after a crash');
const GROUP = 'restore:crash';
const RETURN_TIMEOUT = 40000;
const NOTED_AFTER = 1500;

interface Placed {
  title: string;
  pid: number;
  workspace: number;
  frame: Box;
  maximized: boolean;
}

interface Data {
  kestrel: number;
  rover: number;
  notebookPid: number;
  windows: Placed[];
}

const {current, next, done} = phases<Data>(GROUP);
const ownPid = () => Gio.Credentials.new().get_unix_pid();
const roverWindows = () => global.display.list_all_windows().filter(window => window.get_wm_class() === 'com.lantharos.rover' && window.get_compositor_private());
const ROVER_FRAME = {x: 200, y: 80, width: 1040, height: 680};
const NOTEBOOK_FRAME = {x: 220, y: 140, width: 620, height: 380};

function moveTo(window: Meta.Window, frame: Box): boolean {
  if (near(boxOf(window), frame)) return true;
  window.move_resize_frame(true, frame.x, frame.y, frame.width, frame.height);
  return false;
}

const placedOf = (window: Meta.Window): Placed =>
  ({title: window.get_title()!, pid: window.get_pid() as number, workspace: window.get_workspace()!.index(), frame: boxOf(window), maximized: maximized(window)});

async function prepare(): Promise<never> {
  await install(NOTEBOOK);
  const rover = launchDetached('rover', scratch('rover-restore.log'));
  const [roverWindow] = await eventually(() => roverWindows().filter(windowShown).length === 1 && roverWindows(), 'Rover opens', RETURN_TIMEOUT);
  const [first, second] = (await open(NOTEBOOK)).toSorted((a, b) => a.get_title()!.localeCompare(b.get_title()!));
  await settled();
  const manager = global.workspace_manager;
  if (manager.n_workspaces < 2) manager.append_new_workspace(false, global.get_current_time());
  await eventually(() => [moveTo(roverWindow, ROVER_FRAME), moveTo(first, NOTEBOOK_FRAME)].every(Boolean), 'the windows are moved before the crash');
  roverWindow.change_workspace_by_index(1, false);
  second.maximize();
  await settled();
  await pause(NOTED_AFTER);
  await capture('restore-before-crash');
  next('crashed', {kestrel: ownPid(), rover, notebookPid: first.get_pid() as number, windows: [roverWindow, first, second].map(placedOf)});
  return crashKestrel();
}

async function crashed(data: Data) {
  require(ownPid() !== data.kestrel, 'Kestrel starts again after it crashes');
  await eventually(() => data.windows.every(saved => titled(saved.title)), 'every window comes back', RETURN_TIMEOUT);
  await pause(NOTED_AFTER);
  require(roverWindows().length === 1 && roverWindows()[0].get_pid() === data.windows[0].pid, 'Rover reconnects and is not opened a second time');
  require(processesOf(NOTEBOOK).size === 1 && windowsOf(NOTEBOOK).length === NOTEBOOK.windows, 'the app that closed with Kestrel opens again, once');
  require(!processesOf(NOTEBOOK).has(data.notebookPid), 'that app is a new process');
  for (const saved of data.windows) {
    const window = titled(saved.title)!;
    require(window.get_workspace()?.index() === saved.workspace, `${saved.title} comes back on its workspace`);
    require(maximized(window) === saved.maximized && (saved.maximized || near(boxOf(window), saved.frame)), `${saved.title} comes back where it was`);
  }
  await capture('restore-after-crash');
  quit(NOTEBOOK);
  Gio.Subprocess.new(['kill', String(data.rover)], Gio.SubprocessFlags.NONE);
  await eventually(() => !roverWindows().length && !windowsOf(NOTEBOOK).length, 'the apps close');
  uninstall(NOTEBOOK);
  forgetCrashes();
  done();
}

export async function run() {
  const saved = current();
  if (!saved) return prepare();
  return crashed(saved.data);
}

export const timeout = 120000;
