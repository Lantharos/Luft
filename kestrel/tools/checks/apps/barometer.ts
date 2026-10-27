import GLib from 'gi://GLib';

import type {LuftApp} from '../lib/apps/luftApp.js';
import {checks} from '../lib/check.js';
import {rest, type Point} from '../lib/input/input.js';
import {spawn, windows, windowShown} from '../lib/processes.js';
import type {Frame} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {changes, openApp, withApp} from './lib/apps.js';
import {checkPalette, withPalette} from './lib/palette.js';

const {require, eventually} = checks('Luft app');
const MAILMAN = 'com.lantharos.mailman';
const SAMPLER = 'barometer-sampl';
const CONTENT = {x: 280, y: 0, width: 840};
const NAMES = {x: 290, y: 100, width: 250, height: 90};
const OPEN: Point = [465, 154];
const STOP: Point = [524, 154];
const SETTLE = 3000;
const MEASURED_SAMPLES = 10;
const SAMPLE_INTERVAL = 1000;
const REOPEN_TIMEOUT = 15000;
const SHOW_TIMEOUT = 5000;
const FORCE_AFTER = 5000;
const MIB = 1024 * 1024;

const decoder = new TextDecoder();
const read = (path: string) => decoder.decode(GLib.file_get_contents(path)[1]).trim();
const mailmanWindow = () => windows().find(window => window.get_wm_class() === MAILMAN && windowShown(window));
const scopeOf = (pid: number) => `/sys/fs/cgroup${read(`/proc/${pid}/cgroup`).split('::')[1]}`;

function samplerNanoseconds(pid: number) {
  const tasks = `/proc/${pid}/task`;
  const directory = GLib.Dir.open(tasks, 0);
  try {
    for (let task = directory.read_name(); task; task = directory.read_name()) {
      if (read(`${tasks}/${task}/comm`) === SAMPLER) return Number(read(`${tasks}/${task}/schedstat`).split(' ')[0]);
    }
  } finally {
    directory.close();
  }
  throw new Error('Barometer has no sampler thread');
}

async function measureSampler(barometer: LuftApp) {
  const before = samplerNanoseconds(barometer.pid);
  await pause(MEASURED_SAMPLES * SAMPLE_INTERVAL);
  const perSample = (samplerNanoseconds(barometer.pid) - before) / MEASURED_SAMPLES / 1e6;
  console.log(`Kestrel Luft app check: Barometer's apps view takes ${perSample.toFixed(2)} ms of processor time per sample`);
}

function shows(barometer: LuftApp, expected: Frame, label: string) {
  return eventually(async () => (await barometer.frame(barometer.area(NAMES))).looksLike(expected), label, SHOW_TIMEOUT);
}

async function press(barometer: LuftApp, point: Point) {
  barometer.click(point);
  rest();
}

async function checkBackgroundApps() {
  const slice = `luftcheck${GLib.random_int()}.slice`;
  const mailman = await openApp('mailman', [], {}, {slice});
  try {
    const scope = scopeOf(mailman.pid);
    const barometer = await openApp('barometer', [], {LUFT_SAMPLE_SYSTEM: null, LUFT_APP_SLICE: GLib.path_get_dirname(scope)});
    try {
      rest();
      await pause(SETTLE);
      const open = await barometer.frame(barometer.area(NAMES));
      const background = await changes(barometer, 'Barometer lists Mailman as running in the background once its window closes',
        () => mailman.window.delete(global.get_current_time()), NAMES);
      require(!mailmanWindow(), 'closing Mailman closes its window');
      await pause(SETTLE);
      (await barometer.settle(() => true, barometer.area(CONTENT))).save('barometer-background');
      console.log(`Kestrel Luft app check: Mailman uses ${(Number(read(`${scope}/memory.current`)) / MIB).toFixed(1)} MB in the background`);
      await measureSampler(barometer);

      await press(barometer, OPEN);
      const reopened = await eventually(mailmanWindow, "Open brings Mailman's window back", REOPEN_TIMEOUT);
      barometer.window.activate(global.get_current_time());
      await shows(barometer, open, 'Barometer lists Mailman among the open apps again');
      reopened.delete(global.get_current_time());
      await shows(barometer, background, 'closing Mailman again puts it back under Running in the background');

      const stopping = GLib.get_monotonic_time();
      await press(barometer, STOP);
      await mailman.finished(FORCE_AFTER);
      const seconds = (GLib.get_monotonic_time() - stopping) / 1e6;
      require(seconds * 1000 < FORCE_AFTER, `Mailman quits ${seconds.toFixed(1)} s after Stop, before Barometer would force it`);
      await eventually(() => !GLib.file_test(scope, GLib.FileTest.EXISTS), "Mailman's scope and its memory are gone");
      await eventually(async () => !(await barometer.frame(barometer.area(NAMES))).looksLike(background), 'Barometer no longer lists Mailman', SHOW_TIMEOUT);
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
