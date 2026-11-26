import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

import {environment, type LuftApp} from '../lib/apps/luftApp.js';
import type {Query} from '../lib/apps/probe.js';
import {checks} from '../lib/check.js';
import {press as pressKeys, rest} from '../lib/input/input.js';
import {spawn, windows, windowShown} from '../lib/processes.js';
import type {Frame} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {changes, openApp, withApp} from './lib/apps.js';
import {checkPalette, withPalette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const MAILMAN = 'com.lantharos.mailman';
const CONTENT = {x: 280, y: 0, width: 840};
const MAILMAN_ROW = {role: 'row', has: {text: 'Mailman'}};
const ROWS = {x: 290, y: 116, width: 250, height: 150};
const SETTLE = 3000;
const REOPEN_TIMEOUT = 15000;
const SHOW_TIMEOUT = 5000;
const ANSWER_TIMEOUT = 12000;
const FORCE_AFTER = 5000;
const MIB = 1024 * 1024;
const BY_NAME = {sort: {column: 'name', direction: 'ascending'}};

const decoder = new TextDecoder();
const read = (path: string) => decoder.decode(GLib.file_get_contents(path)[1]).trim();
const mailmanWindow = () => windows().find(window => window.get_wm_class() === MAILMAN && windowShown(window));
const scopeOf = (pid: number) => `/sys/fs/cgroup${read(`/proc/${pid}/cgroup`).split('::')[1]}`;
const signal = (pid: number, name: string) => spawn(['kill', `-${name}`, String(pid)]).exited;

function sortByName() {
  const folder = GLib.build_filenamev([environment().HOME!, '.config', 'barometer']);
  GLib.mkdir_with_parents(folder, 0o755);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'settings.json']), JSON.stringify(BY_NAME));
}

function rows(barometer: LuftApp) {
  return barometer.frame(barometer.area(ROWS));
}

function shows(barometer: LuftApp, expected: Frame, label: string) {
  return eventually(async () => (await rows(barometer)).looksLike(expected), label, SHOW_TIMEOUT);
}

async function press(barometer: LuftApp, control: Query, button: number = Clutter.BUTTON_PRIMARY) {
  barometer.click(await barometer.find(control), button);
  rest();
}

async function save(barometer: LuftApp, name: string) {
  await pause(SETTLE);
  (await barometer.settle(() => true, barometer.area(CONTENT))).save(name);
}

async function checkViews(barometer: LuftApp) {
  await save(barometer, 'barometer-grouped');
  await changes(barometer, "Barometer shows Mailman's window and processes under its row", () => press(barometer, {role: 'button', name: 'Show processes', within: MAILMAN_ROW}), ROWS);
  await save(barometer, 'barometer-expanded');
  await changes(barometer, 'Barometer folds Mailman back into one row', () => press(barometer, {role: 'button', name: 'Hide processes', within: MAILMAN_ROW}), ROWS);
  await changes(barometer, 'Barometer lists every process on its own', () => press(barometer, {role: 'radio', name: 'All processes'}), ROWS);
  await save(barometer, 'barometer-flat');
  await press(barometer, {role: 'button', name: 'Name'}, Clutter.BUTTON_SECONDARY);
  await save(barometer, 'barometer-columns');
  pressKeys(Clutter.KEY_Escape);
  await changes(barometer, 'Barometer groups processes again', () => press(barometer, {role: 'radio', name: 'Grouped'}), ROWS);
}

async function checkNotResponding(barometer: LuftApp) {
  const window = mailmanWindow()!;
  const pid = window.get_pid();
  const ping = () => window.check_alive(global.display.get_current_time_roundtrip());
  barometer.window.activate(global.get_current_time());
  await pause(SETTLE);
  const answering = await rows(barometer);
  await signal(pid, 'STOP');
  try {
    ping();
    await eventually(() => !window.is_alive, 'Kestrel finds that Mailman stopped answering', ANSWER_TIMEOUT);
    await eventually(async () => !(await rows(barometer)).looksLike(answering), 'Barometer marks Mailman as not responding', SHOW_TIMEOUT);
    await save(barometer, 'barometer-not-responding');
  } finally {
    await signal(pid, 'CONT');
  }
  ping();
  await eventually(() => window.is_alive, 'Mailman answers Kestrel again', ANSWER_TIMEOUT);
  await shows(barometer, answering, 'Barometer drops the mark once Mailman answers again');
}

async function checkBackgroundApps() {
  const slice = `luftcheck${GLib.random_int()}.slice`;
  const mailman = await openApp('mailman', [], {}, {slice});
  try {
    const scope = scopeOf(mailman.pid);
    sortByName();
    const barometer = await openApp('barometer', [], {LUFT_SAMPLE_SYSTEM: null, LUFT_APP_SLICE: GLib.path_get_dirname(scope)}, {slice});
    try {
      rest();
      await pause(SETTLE);
      await checkViews(barometer);
      await checkNotResponding(barometer);
      const open = await rows(barometer);
      const background = await changes(barometer, 'Barometer moves Mailman under Background once its window closes',
        () => mailman.window.delete(global.get_current_time()), ROWS);
      require(!mailmanWindow(), 'closing Mailman closes its window');
      await save(barometer, 'barometer-background');
      console.log(`Kestrel Luft app check: Mailman uses ${(Number(read(`${scope}/memory.current`)) / MIB).toFixed(1)} MB in the background`);
      await press(barometer, {role: 'button', name: 'Open'});
      const reopened = await eventually(mailmanWindow, "Open brings Mailman's window back", REOPEN_TIMEOUT);
      barometer.window.activate(global.get_current_time());
      await shows(barometer, open, 'Barometer lists Mailman among the apps again');
      reopened.delete(global.get_current_time());
      await shows(barometer, background, 'closing Mailman again puts it back under Background');

      const stopping = GLib.get_monotonic_time();
      await press(barometer, {role: 'button', name: 'Stop'});
      await mailman.finished(FORCE_AFTER);
      const seconds = (GLib.get_monotonic_time() - stopping) / 1e6;
      require(seconds * 1000 < FORCE_AFTER, `Mailman quits ${seconds.toFixed(1)} s after Stop, before Barometer would force it`);
      await eventually(() => !GLib.file_test(scope, GLib.FileTest.EXISTS), "Mailman's scope and its memory are gone");
      await eventually(async () => !(await rows(barometer)).looksLike(background), 'Barometer no longer lists Mailman', SHOW_TIMEOUT);
    } finally {
      await barometer.close();
    }
  } finally {
    await mailman.close();
    await spawn(['systemctl', '--user', 'stop', slice]).exited;
  }
}

export async function run() {
  await withPalette(palette => withApp('barometer', [], app => checkPalette(app, palette)));
  await checkBackgroundApps();
}
