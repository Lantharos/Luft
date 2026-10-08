import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {dismissImmediately, toggleSurface} from 'resource:///com/lantharos/kestrel/ui/kestrelUi.js';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';
import * as MessageTray from 'resource:///com/lantharos/kestrel/ui/messageTray.js';

import {descendants, firstStyled, named} from '../checks/lib/actors.js';
import {pause, settled} from '../checks/lib/wait.js';

const MEASURE_SETTLE = 3000;
const OPENING = 500_000;
const IDLE_SAMPLE = 2000;
const FRAME = 16;
const START_QUERIES = ['f', 'fi', 'fil', 'files', 'file', 'fi', ''];
const EMOJI_QUERIES = ['p', 'pa', 'par', 'part', 'party', 'h', 'he', 'heart', 'smiling face', ''];

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
  await measureIdle();
}
