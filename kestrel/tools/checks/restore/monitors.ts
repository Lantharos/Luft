import Gio from 'gi://Gio';

import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {install, NOTEBOOK, open, quit, titled, uninstall, windowsOf} from './lib/apps.js';
import {boxOf, maximized, phases, restart, sessionRecord, signOutOfSession} from './lib/signIn.js';

const {require, eventually} = checks('session restore on other displays');
const GROUP = 'restore:monitors';
const RESTORE_TIMEOUT = 40000;
const NOTED_AFTER = 1500;
const SECOND = 1;
const ONE_DISPLAY = 'default';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

interface Data {
  moved: string;
  maximized: string;
}

const {current, next, done} = phases<Data>(GROUP);

async function prepare(): Promise<never> {
  require(global.display.get_n_monitors() === 2, 'the session starts with two displays');
  kestrel.set_boolean('reopen-apps', true);
  await install(NOTEBOOK);
  const [moved, wide] = (await open(NOTEBOOK)).toSorted((a, b) => a.get_title()!.localeCompare(b.get_title()!));
  const second = global.display.get_monitor_geometry(SECOND);
  moved.move_to_monitor(SECOND);
  await settled();
  moved.move_resize_frame(true, second.x + 400, second.y + 160, 760, 500);
  wide.move_to_monitor(SECOND);
  wide.maximize();
  await settled();
  await pause(NOTED_AFTER);
  await eventually(() => sessionRecord()?.windows.filter(window => window.monitor === SECOND).length === 2, 'both windows are noted on the second display');
  await restart('Restart');
  next('signedIn', {moved: moved.get_title()!, maximized: wide.get_title()!}, ONE_DISPLAY);
  return signOutOfSession();
}

async function signedIn(data: Data) {
  require(global.display.get_n_monitors() === 1, 'the next sign-in has only one display');
  const area = global.workspace_manager.get_active_workspace().get_work_area_for_monitor(0);
  await eventually(() => titled(data.moved) && titled(data.maximized), 'the windows open again', RESTORE_TIMEOUT);
  await eventually(() => sessionRecord()?.ending === 'running', 'putting the windows back finishes', RESTORE_TIMEOUT);
  await settled();
  const moved = titled(data.moved)!;
  const frame = boxOf(moved);
  require(moved.get_monitor() === 0 && frame.x >= area.x && frame.y >= area.y && frame.x + frame.width <= area.x + area.width && frame.y + frame.height <= area.y + area.height,
    'a window from the missing display opens whole on the one that is left');
  require(frame.width === 760 && frame.height === 500, 'it keeps its size where it fits');
  const wide = titled(data.maximized)!;
  require(maximized(wide) && wide.get_monitor() === 0, 'a maximized window opens maximized on the display that is left');
  await capture('restore-other-displays');
  quit(NOTEBOOK);
  await eventually(() => !windowsOf(NOTEBOOK).length, 'the app closes');
  uninstall(NOTEBOOK);
  kestrel.reset('reopen-apps');
  done();
}

export async function run() {
  const saved = current();
  if (!saved) return prepare();
  return signedIn(saved.data);
}

export const timeout = 120000;
