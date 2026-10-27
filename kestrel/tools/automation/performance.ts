import type Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import System from 'system';
import {dismissImmediately, surfacesPrepared, toggleSurface, Main, MessageTray} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, existing, firstStyled, named, ofType} from '../checks/lib/actors.js';
import {gjs, stop, stopAll, waitForWindow, waitForWindows} from '../checks/lib/processes.js';
import {pause, settled, waitUntil} from '../checks/lib/wait.js';

const MEASURE_SETTLE = 3000;
const OPENING = 500_000;
const IDLE_SAMPLE = 2000;
const WAKEUP_SAMPLE = 30000;
const SETTINGS_COMMAND = 'kestrel-setting';
const FRAME = 16;
const START_QUERIES = ['f', 'fi', 'fil', 'files', 'file', 'fi', ''];
const EMOJI_QUERIES = ['p', 'pa', 'par', 'part', 'party', 'h', 'he', 'heart', 'smiling face', ''];
const CLIPBOARD_IMAGES = 16;
const CLIPBOARD_IMAGE_SIZE = [1920, 1080] as const;
const TRAY_SAMPLE = 5000;
const TASK_VIEW_WINDOWS = 6;
const IMAGE_TIMEOUT = 15000;
const MEMORY_SAMPLE_INTERVAL = 50;
const AFTER_BURST = 3000;

const read = (path: string) => new TextDecoder().decode(GLib.file_get_contents(path)[1]);
const milliseconds = (microseconds: number) => Number((microseconds / 1000).toFixed(2));
const report = (values: object) => console.log(`Kestrel performance: ${JSON.stringify(values)}`);

function processMetrics() {
  const residentKb = Number(/VmRSS:\s+(\d+)/.exec(read('/proc/self/status'))![1]);
  const startedSeconds = Number(read('/proc/self/stat').split(') ')[1].split(' ')[19]) / 100;
  const runningSeconds = Number(read('/proc/uptime').split(' ')[0]) - startedSeconds;
  return {residentMemoryMb: Math.round(residentKb / 1024), secondsSinceLaunch: Number(runningSeconds.toFixed(2))};
}

const startButtons = (start: Clutter.Actor) => new Set(descendants(start).filter(actor => actor.name?.startsWith('kestrel-start-item-')));
const startIcons = (start: Clutter.Actor) => [...startButtons(start)].flatMap(descendants).filter(actor => actor instanceof St.Icon);
const iconLoaded = (icon: St.Icon) => icon.get_children().some(child => child.content && child.opacity > 0);

async function dismiss() {
  dismissImmediately();
  await settled();
}

async function measureStartOpening(label: string) {
  const start = existing('kestrel-start');
  const frames: number[] = [];
  let iconsReady: number | null = null;
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

async function measureEmojiOpening(label: string) {
  const opened = GLib.get_monotonic_time();
  let firstFrame = 0;
  const painted = global.stage.connect('after-paint', () => (firstFrame ||= GLib.get_monotonic_time()));
  toggleSurface('emoji');
  const toggle = GLib.get_monotonic_time() - opened;
  await settled(MEASURE_SETTLE);
  global.stage.disconnect(painted);
  report({emojiOpening: label, toggleMs: milliseconds(toggle), firstFrameMs: milliseconds(firstFrame - opened), ...processMetrics()});
}

async function timeQueries(entry: St.Entry, queries: string[], rounds: number) {
  const durations: number[] = [];
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
  const {updates, median, p95} = await timeQueries(ofType(firstStyled('kestrel-emoji-search'), St.Entry), EMOJI_QUERIES, 10);
  report({emojiSearchUpdates: updates, emojiSearchMedianMs: median, emojiSearchP95Ms: p95});
  await dismiss();
}

async function longestStall(during: () => Promise<void>) {
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
  const start = existing('kestrel-start');
  const original = startButtons(start);
  const {updates, median, p95} = await timeQueries(ofType(start.get_first_child(), St.Entry), START_QUERIES, 20);
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
  const list = firstStyled('kestrel-notification-list', existing('kestrel-notifications'))!;
  let added = 0;
  const signal = list.connect('child-added', () => added++);
  const sources: InstanceType<typeof MessageTray.Source>[] = [];
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

function noisyImages(count: number, [width, height]: readonly [number, number]) {
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
  const directory = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, 'clipboard']));
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
  const tray = ofType(named('kestrel-tray'), St.Button);
  const app = gjs('clients/apps/trayApp.js', ['--animate']);
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
  for (const title of titles) gjs('clients/windows/stripedWindow.js', [title, '640', '400']);
  try {
    await waitForWindows(titles);
    await settled(MEASURE_SETTLE);
    toggleSurface('tasks');
    await settled(MEASURE_SETTLE);
    const cards = existing('kestrel-task-windows');
    const desktops = existing('kestrel-task-view').get_last_child()!;
    let cardsCreated = 0;
    let desktopsCreated = 0;
    const signals: [Clutter.Actor, number][] = [[cards, cards.connect('child-added', () => cardsCreated++)], [desktops, desktops.connect('child-added', () => desktopsCreated++)]];
    const longestStallMs = await longestStall(async () => {
      gjs('clients/windows/stripedWindow.js', ['Kestrel task view added', '640', '400']);
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

function threadSwitches(pid = 'self') {
  const tasks = Gio.File.new_for_path(`/proc/${pid}/task`).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const switches = new Map<string, number>();
  for (let info: Gio.FileInfo | null; (info = tasks.next_file(null));) {
    const status = read(`/proc/${pid}/task/${info.get_name()}/status`);
    switches.set(info.get_name(), Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]));
  }
  return switches;
}

function sessionPidOf(command: string) {
  const bus = `DBUS_SESSION_BUS_ADDRESS=${GLib.getenv('DBUS_SESSION_BUS_ADDRESS')}`;
  const processes = Gio.File.new_for_path('/proc').enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  for (let info: Gio.FileInfo | null; (info = processes.next_file(null));) {
    const pid = info.get_name();
    if (!/^\d+$/.test(pid)) continue;
    try {
      if (read(`/proc/${pid}/comm`).trim() === command && read(`/proc/${pid}/environ`).split('\0').includes(bus)) return pid;
    } catch {}
  }
  return null;
}

const switchesSince = (before: Map<string, number>, after: Map<string, number>) => [...after].reduce((sum, [thread, count]) => sum + count - (before.get(thread) ?? 0), 0);
const perSecond = (count: number) => Number((count / (WAKEUP_SAMPLE / 1000)).toFixed(2));

const cpuTicks = () => read('/proc/self/stat').split(') ')[1].split(' ').slice(11, 13).map(Number).reduce((a, b) => a + b);

async function measureIdleWakeups() {
  const settings = sessionPidOf(SETTINGS_COMMAND);
  const before = threadSwitches();
  const settingsBefore = settings ? threadSwitches(settings) : null;
  const ticks = cpuTicks();
  await pause(WAKEUP_SAMPLE);
  const seconds = WAKEUP_SAMPLE / 1000;
  report({
    idleWakeupsPerSecond: perSecond(switchesSince(before, threadSwitches())),
    idleSettingsWakeupsPerSecond: settings && settingsBefore ? perSecond(switchesSince(settingsBefore, threadSwitches(settings))) : null,
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
  const startupStallMs = await longestStall(async () => {
    await settled();
    await surfacesPrepared();
    await settled(MEASURE_SETTLE);
  });
  report({startupStallMs});
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
