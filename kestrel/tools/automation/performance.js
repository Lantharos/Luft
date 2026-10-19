import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import System from 'system';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {descendants, firstStyled, named} from '../checks/lib/actors.js';
import {gjs, stop, stopAll, waitForWindow, waitForWindows} from '../checks/lib/processes.js';
import {pause, settled, waitUntil} from '../checks/lib/wait.js';

const MEASURE_SETTLE = 3000;
const OPENING = 500_000;
const IDLE_SAMPLE = 2000;
const WAKEUP_SAMPLE = 10000;
const FRAME = 16;
const START_QUERIES = ['f', 'fi', 'fil', 'files', 'file', 'fi', ''];
const EMOJI_QUERIES = ['p', 'pa', 'par', 'part', 'party', 'h', 'he', 'heart', 'smiling face', ''];
const CLIPBOARD_IMAGES = 16;
const CLIPBOARD_IMAGE_SIZE = [1920, 1080];
const TRAY_SAMPLE = 5000;
const TASK_VIEW_WINDOWS = 6;
const IMAGE_TIMEOUT = 15000;
const MEMORY_SAMPLE_INTERVAL = 50;
const AFTER_BURST = 3000;

const read = path => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
const milliseconds = microseconds => Number((microseconds / 1000).toFixed(2));
const report = values => console.log(`Kestrel performance: ${JSON.stringify(values)}`);

function processMetrics() {
  const residentKb = Number(/VmRSS:\s+(\d+)/.exec(read('/proc/self/status'))[1]);
  const startedSeconds = Number(read('/proc/self/stat').split(') ')[1].split(' ')[19]) / 100;
  const runningSeconds = Number(read('/proc/uptime').split(' ')[0]) - startedSeconds;
  return {residentMemoryMb: Math.round(residentKb / 1024), secondsSinceLaunch: Number(runningSeconds.toFixed(2))};
}

const startButtons = start => new Set(descendants(start).filter(actor => actor.name?.startsWith('kestrel-start-item-')));
const startIcons = start => [...startButtons(start)].flatMap(descendants).filter(actor => actor instanceof St.Icon);
const iconLoaded = icon => icon.get_children().some(child => child.content && child.opacity > 0);

async function dismiss() {
  dismissImmediately();
  await settled();
}

async function measureStartOpening(label) {
  const start = named('kestrel-start');
  const frames = [];
  let iconsReady = null;
  const opened = GLib.get_monotonic_time();
  const painted = global.stage.connect('after-paint', () => {
    const now = GLib.get_monotonic_time();
    frames.push(now);
    if (iconsReady === null && startIcons(start).every(iconLoaded)) iconsReady = now - opened;
  });
  toggleSurface('start');
  const toggle = GLib.get_monotonic_time() - opened;
  await settled(MEASURE_SETTLE);
  global.stage.disconnect(painted);
  const opening = frames.filter(time => time - opened < OPENING);
  const intervals = opening.slice(1).map((time, index) => time - opening[index]);
  report({
    startOpening: label,
    toggleMs: milliseconds(toggle),
    firstFrameMs: frames.length ? milliseconds(frames[0] - opened) : null,
    iconsReadyMs: iconsReady && milliseconds(iconsReady),
    icons: startIcons(start).length,
    longestFrameMs: milliseconds(Math.max(...intervals)),
    ...processMetrics(),
  });
  await dismiss();
}

async function measureEmojiOpening(label) {
  const opened = GLib.get_monotonic_time();
  let firstFrame = 0;
  const painted = global.stage.connect('after-paint', () => (firstFrame ||= GLib.get_monotonic_time()));
  toggleSurface('emoji');
  const toggle = GLib.get_monotonic_time() - opened;
  await settled(MEASURE_SETTLE);
  global.stage.disconnect(painted);
  report({emojiOpening: label, toggleMs: milliseconds(toggle), firstFrameMs: milliseconds(firstFrame - opened), ...processMetrics()});
}

async function timeQueries(entry, queries, rounds) {
  const durations = [];
  for (let round = 0; round < rounds; round++) {
    for (const query of queries) {
      const before = GLib.get_monotonic_time();
      entry.set_text(query);
      durations.push(milliseconds(GLib.get_monotonic_time() - before));
      await pause(FRAME);
    }
  }
  durations.sort((a, b) => a - b);
  return {updates: durations.length, median: durations[Math.floor(durations.length / 2)], p95: durations[Math.floor(durations.length * 0.95)]};
}

async function measureEmojiSearch() {
  const {updates, median, p95} = await timeQueries(firstStyled('kestrel-emoji-search'), EMOJI_QUERIES, 10);
  report({emojiSearchUpdates: updates, emojiSearchMedianMs: median, emojiSearchP95Ms: p95});
  await dismiss();
}

async function longestStall(during) {
  let last = GLib.get_monotonic_time();
  let longest = 0;
  const tick = GLib.timeout_add(GLib.PRIORITY_HIGH, 2, () => {
    const now = GLib.get_monotonic_time();
    longest = Math.max(longest, now - last);
    last = now;
    return GLib.SOURCE_CONTINUE;
  });
  await during();
  GLib.source_remove(tick);
  return milliseconds(longest);
}

async function measureIconStyles() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  try {
    for (const style of ['tinted', 'clear']) {
      settings.set_string('app-icon-style', style);
      await settled(MEASURE_SETTLE);
      await measureStartOpening(`${style} first`);
      await measureStartOpening(`${style} again`);
    }
    toggleSurface('start');
    await settled(MEASURE_SETTLE);
    for (const style of ['tinted', 'clear']) {
      const longestStallMs = await longestStall(async () => {
        settings.set_string('app-icon-style', style);
        await settled(MEASURE_SETTLE);
      });
      report({restyle: style, longestStallMs});
    }
  } finally {
    settings.reset('app-icon-style');
    await dismiss();
  }
}

async function measureStartSearch() {
  toggleSurface('start');
  await settled(MEASURE_SETTLE);
  const start = named('kestrel-start');
  const original = startButtons(start);
  const {updates, median, p95} = await timeQueries(start.get_first_child(), START_QUERIES, 20);
  const current = startButtons(start);
  report({
    searchUpdates: updates,
    searchMedianMs: median,
    searchP95Ms: p95,
    rootButtons: original.size,
    retainedRootButtons: [...original].filter(actor => current.has(actor)).length,
  });
  await dismiss();
}

async function measureNotificationBurst() {
  const list = firstStyled('kestrel-notification-list', named('kestrel-notifications'));
  let added = 0;
  const signal = list.connect('child-added', () => added++);
  const sources = [];
  try {
    for (let index = 0; index < 8; index++) {
      const source = new MessageTray.Source({title: `Performance ${index}`});
      Main.messageTray.add(source);
      sources.push(source);
      for (let item = 0; item < 10; item++)
        source.addNotification(new MessageTray.Notification({source, title: `Item ${item}`, body: 'Notification workload', acknowledged: true}));
    }
    await settled();
    const hiddenRowsCreated = added;
    toggleSurface('notifications');
    await settled(MEASURE_SETTLE);
    const displayedRows = list.get_n_children();
    added = 0;
    for (const source of sources) source.notifications[0].title = 'Updated';
    await settled();
    const rowsCreatedForUpdates = added;
    added = 0;
    for (const source of sources.splice(0)) source.destroy();
    await settled();
    report({hiddenRowsCreated, displayedRows, rowsCreatedForUpdates, rowsCreatedDuringClear: added});
  } finally {
    list.disconnect(signal);
    for (const source of sources) source.destroy();
    await dismiss();
  }
}

function noisyImages(count, [width, height]) {
  const pixels = new Uint8Array(width * height * 3);
  let seed = 11;
  for (let index = 0; index < pixels.length; index++) pixels[index] = (seed = seed * 1103515245 + 12345 >>> 0) >>> 24;
  return Array.from({length: count}, (_, image) => {
    pixels[0] = image;
    const pixbuf = GdkPixbuf.Pixbuf.new_from_bytes(new GLib.Bytes(pixels), GdkPixbuf.Colorspace.RGB, false, 8, width, height, width * 3);
    return new GLib.Bytes(pixbuf.save_to_bufferv('png', ['compression'], ['1'])[1]);
  });
}

function storedClipboardImages() {
  const directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY'), 'clipboard']));
  return directory.query_exists(null) ? [...directory.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name()) : [];
}

async function measureClipboardImages() {
  const clipboard = St.Clipboard.get_default();
  const images = noisyImages(CLIPBOARD_IMAGES, CLIPBOARD_IMAGE_SIZE);
  System.gc();
  await settled(MEASURE_SETTLE);
  const before = processMetrics().residentMemoryMb;
  let peak = before;
  const sampler = GLib.timeout_add(GLib.PRIORITY_HIGH, MEMORY_SAMPLE_INTERVAL, () => {
    peak = Math.max(peak, processMetrics().residentMemoryMb);
    return GLib.SOURCE_CONTINUE;
  });
  const started = GLib.get_monotonic_time();
  const longestStallMs = await longestStall(async () => {
    for (const image of images) {
      const stored = storedClipboardImages();
      clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', image);
      await waitUntil(() => storedClipboardImages().some(name => !stored.includes(name)), 'a copied image is kept', IMAGE_TIMEOUT);
    }
  });
  const keptMs = milliseconds(GLib.get_monotonic_time() - started);
  await pause(AFTER_BURST);
  GLib.source_remove(sampler);
  await pause(WAKEUP_SAMPLE);
  report({
    clipboardImages: images.length, keptMs, longestStallMs,
    residentBeforeMb: before, residentPeakMb: peak, residentSettledMb: processMetrics().residentMemoryMb,
  });
  clipboard.set_text(St.ClipboardType.CLIPBOARD, '');
}

async function measureTrayUpdates() {
  const tray = named('kestrel-tray');
  const app = gjs('clients/trayApp.js', ['--animate']);
  try {
    await waitUntil(() => tray.visible, 'the tray shows the animated app');
    await settled();
    let previewIconsCreated = 0;
    const signal = tray.child.connect('child-added', () => previewIconsCreated++);
    const ticks = cpuTicks();
    await pause(TRAY_SAMPLE);
    tray.child.disconnect(signal);
    report({trayCpuPercent: Number(((cpuTicks() - ticks) / 100 / (TRAY_SAMPLE / 1000) * 100).toFixed(2)), previewIconsCreated});
  } finally {
    await stop(app);
  }
}

async function measureTaskViewAdd() {
  const titles = Array.from({length: TASK_VIEW_WINDOWS}, (_, index) => `Kestrel task view ${index + 1}`);
  for (const title of titles) gjs('clients/stripedWindow.js', [title, '640', '400']);
  try {
    await waitForWindows(titles);
    await settled(MEASURE_SETTLE);
    toggleSurface('tasks');
    await settled(MEASURE_SETTLE);
    const cards = named('kestrel-task-windows');
    const desktops = named('kestrel-task-view').get_last_child();
    let cardsCreated = 0;
    let desktopsCreated = 0;
    const signals = [[cards, cards.connect('child-added', () => cardsCreated++)], [desktops, desktops.connect('child-added', () => desktopsCreated++)]];
    const longestStallMs = await longestStall(async () => {
      gjs('clients/stripedWindow.js', ['Kestrel task view added', '640', '400']);
      await waitForWindow('Kestrel task view added');
      await waitUntil(() => cards.get_n_children() === TASK_VIEW_WINDOWS + 1, 'the task view shows the added window');
      await settled(MEASURE_SETTLE);
    });
    for (const [actor, id] of signals) actor.disconnect(id);
    report({taskViewAdd: TASK_VIEW_WINDOWS + 1, cardsCreated, desktopsCreated, longestStallMs});
  } finally {
    await dismiss();
    await stopAll();
  }
}

function threadSwitches() {
  const tasks = Gio.File.new_for_path('/proc/self/task').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const switches = new Map();
  for (let info; (info = tasks.next_file(null));) {
    const status = read(`/proc/self/task/${info.get_name()}/status`);
    switches.set(info.get_name(), Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(status)[1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(status)[1]));
  }
  return switches;
}

const cpuTicks = () => read('/proc/self/stat').split(') ')[1].split(' ').slice(11, 13).map(Number).reduce((a, b) => a + b);

async function measureIdleWakeups() {
  const before = threadSwitches();
  const ticks = cpuTicks();
  await pause(WAKEUP_SAMPLE);
  const after = threadSwitches();
  const seconds = WAKEUP_SAMPLE / 1000;
  const switches = [...after].reduce((sum, [thread, count]) => sum + count - (before.get(thread) ?? 0), 0);
  report({
    idleWakeupsPerSecond: Number((switches / seconds).toFixed(1)),
    idleCpuPercent: Number((((cpuTicks() - ticks) / 100 / seconds) * 100).toFixed(2)),
  });
}

async function measureIdle() {
  let frames = 0;
  const painted = global.stage.connect('after-paint', () => frames++);
  await pause(IDLE_SAMPLE);
  global.stage.disconnect(painted);
  report({idleFramesOverTwoSeconds: frames});
}

export async function run() {
  report(processMetrics());
  await settled(MEASURE_SETTLE);
  await measureEmojiOpening('first');
  await dismiss();
  await measureEmojiOpening('again');
  await measureEmojiSearch();
  await measureStartOpening('first');
  await measureStartOpening('again');
  await measureIconStyles();
  await measureStartSearch();
  await measureNotificationBurst();
  await measureClipboardImages();
  await measureTrayUpdates();
  await measureTaskViewAdd();
  await measureIdle();
  await measureIdleWakeups();
}
