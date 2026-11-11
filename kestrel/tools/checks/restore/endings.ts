import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {checks} from '../lib/check.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {GONE, install, LEDGER, NOTEBOOK, open, processesOf, quit, SKETCH, startsBySignIn, STARTUP, titled, uninstall, windowsOf, type TestApp} from './lib/apps.js';
import {boxOf, kestrelUptime, maximized, near, phases, recordMode, restart, sessionRecord, setStagedUpdate, signOutOfSession, type Box} from './lib/signIn.js';

const {require, eventually} = checks('session restore');
const GROUP = 'restore:endings';
const RESTORE_TIMEOUT = 40000;
const NOT_RESTORED_WITHIN = 8000;
const NOTED_AFTER = 1500;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

interface Expected {
  title: string;
  workspace: number;
  frame: Box;
  maximized: boolean;
  edges: number;
}

interface Data {
  windows: Expected[];
  stacking: string[];
  focused: string;
  uptimes: Record<string, number>;
}

const {current, next, done} = phases<Data>(GROUP);
const workArea = () => global.workspace_manager.get_active_workspace().get_work_area_for_monitor(0);
const expectedOf = (window: Meta.Window): Expected =>
  ({title: window.get_title()!, workspace: window.get_workspace()!.index(), frame: boxOf(window), maximized: maximized(window), edges: window.get_tiled_edges()});
const stackingOf = (titles: string[]) => global.display.sort_windows_by_stacking(titles.map(title => titled(title)!)).map(window => window.get_title()!);

async function arrange(): Promise<Data> {
  const [first, second] = (await open(NOTEBOOK)).toSorted((a, b) => a.get_title()!.localeCompare(b.get_title()!));
  const [ledger] = await open(LEDGER);
  const [sketch] = await open(SKETCH);
  const area = workArea();
  const manager = global.workspace_manager;
  if (manager.n_workspaces < 2) manager.append_new_workspace(false, global.get_current_time());
  first.change_workspace_by_index(1, false);
  first.move_resize_frame(true, area.x + 120, area.y + 90, 640, 400);
  ledger.move_resize_frame(true, area.x + 700, area.y + 300, 560, 340);
  Main.wm.snapWindow(sketch, new Mtk.Rectangle({x: area.x, y: area.y, width: Math.floor(area.width / 2), height: area.height}));
  for (const window of [second, ledger, sketch]) {
    window.activate(global.get_current_time());
    await settled();
  }
  second.maximize();
  sketch.activate(global.get_current_time());
  await settled();
  await pause(NOTED_AFTER);
  const windows = [first, second, ledger, sketch].map(expectedOf);
  return {windows, stacking: stackingOf([second, ledger, sketch].map(window => window.get_title()!)), focused: sketch.get_title()!, uptimes: {}};
}

async function noted(apps: TestApp[], label: string) {
  const ids = apps.flatMap(app => Array<string>(app.windows).fill(`${app.id}.desktop`)).sort();
  await eventually(() => {
    const record = sessionRecord();
    return record?.ending === 'running' && JSON.stringify(record.windows.map(window => window.app).sort()) === JSON.stringify(ids);
  }, label, 10000);
}

async function endWith(confirmLabel: string, ending: string, phase: string, data: Data, signedOut: () => void = () => {}): Promise<never> {
  await restart(confirmLabel);
  require(sessionRecord()?.ending === ending, `the record notes that the session ended with ${ending === 'update' ? 'an update' : 'an ordinary restart'}`);
  signedOut();
  next(phase, data);
  return signOutOfSession();
}

function checkPlacement(expected: Expected[]) {
  for (const saved of expected) {
    const window = titled(saved.title)!;
    require(window.get_workspace()?.index() === saved.workspace, `${saved.title} comes back on its workspace`);
    require(maximized(window) === saved.maximized && (saved.maximized || near(boxOf(window), saved.frame)), `${saved.title} comes back where it was`);
    require(window.get_tiled_edges() === saved.edges, `${saved.title} comes back ${saved.edges ? 'tiled' : 'untiled'}`);
  }
}

async function restored(data: Data, apps: TestApp[]) {
  await eventually(() => data.windows.every(saved => titled(saved.title)), 'the apps open again with their windows', RESTORE_TIMEOUT);
  await eventually(() => sessionRecord()?.ending === 'running', 'putting the windows back finishes', RESTORE_TIMEOUT);
  await settled();
  for (const app of apps)
    require(processesOf(app).size === 1 && windowsOf(app).length === app.windows, `${app.name} opens once, with its ${app.windows} window${app.windows > 1 ? 's' : ''}`);
  checkPlacement(data.windows);
}

async function opened() {
  kestrel.reset('reopen-apps');
  await install(NOTEBOOK, SKETCH, LEDGER);
  const data = await arrange();
  await noted([NOTEBOOK, SKETCH, LEDGER], 'the open apps are noted while the session runs');
  require(recordMode() === 0o600, 'only the account can read the record');
  require(!JSON.stringify(sessionRecord()).includes(`${NOTEBOOK.name} 1`), 'the record holds no window titles');
  await capture('restore-before-update');
  await setStagedUpdate(true);
  return endWith('Restart and install', 'update', 'updated', data);
}

async function updated(data: Data) {
  require(!kestrel.get_boolean('reopen-apps'), 'reopening apps is off by default');
  await restored(data, [NOTEBOOK, SKETCH, LEDGER]);
  require(JSON.stringify(stackingOf(data.stacking)) === JSON.stringify(data.stacking), 'the windows come back in their stacking order');
  require(global.display.focus_window?.get_title() === data.focused, 'the window that had focus gets it back');
  await capture('restore-after-update');
  return endWith('Restart', 'ordinary', 'plain', data);
}

async function plain(data: Data) {
  data.uptimes['with a record that stays closed'] = kestrelUptime();
  await pause(NOT_RESTORED_WITHIN);
  require([NOTEBOOK, SKETCH, LEDGER].every(app => !windowsOf(app).length), 'after an ordinary restart the apps stay closed while reopening is off');
  kestrel.set_boolean('reopen-apps', true);
  await install(GONE, STARTUP);
  startsBySignIn(STARTUP);
  const [first, second] = (await open(NOTEBOOK)).toSorted((a, b) => a.get_title()!.localeCompare(b.get_title()!));
  await open(SKETCH);
  await open(GONE);
  await open(STARTUP);
  first.move_resize_frame(true, workArea().x + 60, workArea().y + 40, 700, 460);
  second.maximize();
  await settled();
  await noted([NOTEBOOK, SKETCH, GONE, STARTUP], 'the apps opened after signing in are noted');
  data.windows = [first, second].map(expectedOf);
  return endWith('Restart', 'ordinary', 'reopened', data, () => uninstall(GONE));
}

async function reopened(data: Data) {
  data.uptimes['while reopening apps'] = kestrelUptime();
  await restored(data, [NOTEBOOK]);
  require(windowsOf(SKETCH).length === 1, 'Sketch opens again too');
  require(!windowsOf(STARTUP).length, 'an app that starts by itself at sign-in is not opened a second time');
  require(!windowsOf(GONE).length, 'an app that was removed is left out');
  await capture('restore-after-restart');
  quit(NOTEBOOK, SKETCH);
  await eventually(() => sessionRecord()?.windows.length === 0, 'closing every app empties the record', 10000);
  return endWith('Restart', 'ordinary', 'empty', data);
}

async function empty(data: Data) {
  data.uptimes['with an empty record'] = kestrelUptime();
  await pause(NOT_RESTORED_WITHIN);
  require([NOTEBOOK, SKETCH, STARTUP].every(app => !windowsOf(app).length), 'with nothing noted nothing opens');
  for (const [state, seconds] of Object.entries(data.uptimes)) console.log(`Kestrel session restore: ready ${seconds.toFixed(2)} s after starting ${state}`);
  kestrel.reset('reopen-apps');
  uninstall(NOTEBOOK, SKETCH, LEDGER, STARTUP);
  done();
}

const PHASES: Record<string, (data: Data) => Promise<void>> = {updated, plain, reopened, empty};

export async function run() {
  const saved = current();
  if (!saved) return opened();
  return PHASES[saved.phase](saved.data);
}

export const timeout = 150000;
