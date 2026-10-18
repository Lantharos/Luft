import Gio from 'gi://Gio';

import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {moveBy} from '../lib/input.js';
import {fixture, outputLines, spawn, stop} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {startSessionClient} from './lib/sessionClient.js';

const {require, eventually} = checks('idle');
const SCREEN_SAVER = 'org.freedesktop.ScreenSaver';
const SCREEN_SAVER_PATHS = ['/org/freedesktop/ScreenSaver', '/ScreenSaver'];
const TIMEOUT = 600;

function watchIdle(...args) {
  const process = spawn(['python3', fixture('clients', 'wayland', 'idleClient.py'), `${TIMEOUT}`, ...args], {flags: Gio.SubprocessFlags.STDOUT_PIPE});
  return {process, events: outputLines(process)};
}

const screenSaver = async (method, replyType, path = SCREEN_SAVER_PATHS[0]) =>
  (await call(SCREEN_SAVER, path, SCREEN_SAVER, method, null, replyType)).deepUnpack()[0];

async function checkNotifications() {
  moveBy(5, 5);
  const watcher = watchIdle();
  try {
    await eventually(() => watcher.events.includes('idled'), 'apps hear when nobody has used the computer for a while', 3000);
    moveBy(5, 5);
    await eventually(() => watcher.events.includes('resumed'), 'apps hear when someone uses the computer again');
  } finally {
    await stop(watcher.process);
  }
}

async function checkInhibitors() {
  const player = await startSessionClient('--inhibit');
  moveBy(5, 5);
  const plain = watchIdle();
  const input = watchIdle('--input');
  try {
    await eventually(() => input.events.includes('idled'), 'apps that ask about input alone go idle while a video plays', 3000);
    await pause(TIMEOUT);
    require(!plain.events.includes('idled'), 'a playing video keeps other apps from going idle');
    await stop(player);
    await eventually(() => plain.events.includes('idled'), 'apps go idle once the video stops');
  } finally {
    await Promise.all([stop(player), stop(plain.process), stop(input.process)]);
  }
}

async function checkScreenSaver() {
  moveBy(5, 5);
  await pause(2200);
  require(await screenSaver('GetSessionIdleTime', '(u)') >= 2, 'the screen saver interface reports how long the computer has been idle');
  moveBy(5, 5);
  require(await screenSaver('GetSessionIdleTime', '(u)') === 0, 'the idle time resets when the computer is used');

  const seen = SCREEN_SAVER_PATHS.map(() => []);
  const unsubscribes = SCREEN_SAVER_PATHS.map((path, index) =>
    subscribe({sender: SCREEN_SAVER, iface: SCREEN_SAVER, member: 'ActiveChanged', path}, (_signal, [active]) => seen[index].push(active)));
  try {
    require(!await screenSaver('GetActive', '(b)'), 'the screen saver interface reports an unlocked screen');
    await lock();
    await eventually(() => seen.every(changes => changes.at(-1) === true), 'apps hear when the screen locks on both screen saver paths');
    require(await screenSaver('GetActive', '(b)', SCREEN_SAVER_PATHS[1]), 'the screen saver interface reports a locked screen');
    await unlock();
    await eventually(() => seen.every(changes => changes.at(-1) === false), 'apps hear when the screen unlocks');
  } finally {
    for (const unsubscribe of unsubscribes) unsubscribe();
  }
}

export async function run() {
  await checkNotifications();
  await checkInhibitors();
  await checkScreenSaver();
}
