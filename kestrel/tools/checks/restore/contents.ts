import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import {requireFresh} from '../lib/apps/freshness.js';
import {checks} from '../lib/check.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {phases, restart, sessionRecord, setStagedUpdate, signOutOfSession} from './lib/signIn.js';

const {require, eventually} = checks('session restore of what apps showed');
const GROUP = 'restore:contents';
const OPEN_TIMEOUT = 40000;
const KEPT_TIMEOUT = 10000;

interface ShownApp {
  name: string;
  id: string;
  opened: string;
  shows: string;
}

const KEPT_FOLDER = GLib.build_filenamev([GLib.get_home_dir(), 'Field notes', 'Harbor']);
const ROVER: ShownApp = {name: 'rover', id: 'com.lantharos.rover', opened: Gio.File.new_for_path(KEPT_FOLDER).get_uri(), shows: KEPT_FOLDER};
const SETTINGS: ShownApp = {name: 'settings', id: 'com.lantharos.settings', opened: 'kestrel-settings:input/shortcuts', shows: '"section":"shortcuts"'};
const TERN: ShownApp = {name: 'tern', id: 'com.lantharos.tern', opened: '', shows: 'tabs'};
const RESTORED = [ROVER, SETTINGS];

interface Data {
  kept: Record<string, string>;
}

const {current, next, done} = phases<Data>(GROUP);
const windowsFolder = (app: ShownApp) => GLib.build_filenamev([GLib.get_user_state_dir(), app.id, 'windows']);
const desktopApp = (app: ShownApp) => Shell.AppSystem.get_default().lookup_app(`${app.id}.desktop`)!;
const windowOf = (app: ShownApp): Meta.Window | null =>
  global.get_window_actors().find(actor => actor.mapped && actor.meta_window?.get_wm_class() === app.id)?.meta_window ?? null;

function keptStates(app: ShownApp): string[] {
  const folder = Gio.File.new_for_path(windowsFolder(app));
  if (!folder.query_exists(null)) return [];
  return [...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)]
    .map(info => info.get_name())
    .filter(name => name.endsWith('.json'))
    .map(name => new TextDecoder().decode(GLib.file_get_contents(GLib.build_filenamev([folder.get_path()!, name]))[1]));
}

const keptState = (app: ShownApp) => keptStates(app).find(state => state.includes(app.shows));

function launch(app: ShownApp) {
  const info = desktopApp(app).get_app_info();
  info.launch_uris(app.opened ? [app.opened] : [], global.create_launch_context_for_app(info, 0, -1));
}

const frameOf = (window: Meta.Window) => captureFrame(window.get_frame_rect());

async function shown(app: ShownApp, label: string) {
  const window = await eventually(() => windowOf(app), `${label}: ${app.name} opens`, OPEN_TIMEOUT);
  await eventually(() => keptState(app), `${label}: ${app.name} keeps what it shows`, KEPT_TIMEOUT);
  return window;
}

async function closeNormally(app: ShownApp, label: string) {
  windowOf(app)!.delete(global.get_current_time());
  await eventually(() => !windowOf(app), `${label}: ${app.name} closes`);
  await eventually(() => !keptStates(app).length, `${label}: closing ${app.name} forgets what it showed`, KEPT_TIMEOUT);
}

async function opened() {
  for (const app of [...RESTORED, TERN]) requireFresh(app.name);
  GLib.mkdir_with_parents(KEPT_FOLDER, 0o755);
  GLib.file_set_contents(GLib.build_filenamev([KEPT_FOLDER, 'tides.txt']), 'High water at 06:12 and 18:40\n');
  const kept: Record<string, string> = {};
  for (const app of RESTORED) {
    launch(app);
    const window = await shown(app, 'before the restart');
    await settled();
    (await frameOf(window)).save(`restore-contents-${app.name}-before`);
    kept[app.name] = keptState(app)!;
  }
  for (const app of RESTORED) {
    const files = Gio.File.new_for_path(windowsFolder(app)).enumerate_children('unix::mode', Gio.FileQueryInfoFlags.NONE, null);
    require([...files].every(info => (info.get_attribute_uint32('unix::mode') & 0o777) === 0o600), `only the account can read what ${app.name} keeps`);
  }
  launch(TERN);
  await shown(TERN, 'before the restart');
  await closeNormally(TERN, 'before the restart');
  await eventually(() => sessionRecord()?.windows.filter(window => window.app.startsWith('com.lantharos.')).length === RESTORED.length, 'the record notes the apps still open');
  await capture('restore-contents-before');
  await setStagedUpdate(true);
  await restart('Restart and install');
  next('updated', {kept});
  return signOutOfSession();
}

async function updated({kept}: Data) {
  for (const app of RESTORED) {
    const window = await eventually(() => windowOf(app), `${app.name} opens again`, OPEN_TIMEOUT);
    await eventually(() => keptStates(app).length === 1 && keptStates(app)[0] === kept[app.name], `${app.name} shows what it showed before the restart`, KEPT_TIMEOUT);
    await settled();
    (await frameOf(window)).save(`restore-contents-${app.name}-after`);
  }
  await pause(KEPT_TIMEOUT / 2);
  require(!windowOf(TERN), 'Tern, closed before the restart, stays closed');
  require(!keptStates(TERN).length, 'nothing Tern showed is left behind');
  await capture('restore-contents-after');
  await closeNormally(ROVER, 'after the restart');
  launch({...ROVER, opened: ''});
  await eventually(() => windowOf(ROVER), 'Rover opens again from its launcher', OPEN_TIMEOUT);
  await eventually(() => keptStates(ROVER).length === 1 && !keptStates(ROVER)[0].includes(KEPT_FOLDER), 'Rover opened by hand starts at home instead', KEPT_TIMEOUT);
  for (const app of RESTORED) windowOf(app)?.delete(global.get_current_time());
  await eventually(() => RESTORED.every(app => !windowOf(app)), 'the apps close');
  GLib.spawn_command_line_sync(`rm -rf ${GLib.shell_quote(GLib.path_get_dirname(KEPT_FOLDER))}`);
  done();
}

export async function run() {
  const saved = current();
  if (!saved) return opened();
  return updated(saved.data);
}

export const timeout = 180000;
