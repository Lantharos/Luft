import Gio from 'gi://Gio';

import {checks} from '../lib/check.js';
import {call, subscribe} from '../lib/dbus.js';
import {moveBy} from '../lib/input/input.js';
import {fixture, outputLines, spawn, stop} from '../lib/processes.js';
import {openSecurityContext, through} from '../lib/access/sandbox.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {startSessionClient} from '../system/lib/sessionClient.js';

const {require, eventually} = checks('idle');
const SCREEN_SAVER = 'org.freedesktop.ScreenSaver';
const SCREEN_SAVER_PATHS = ['/org/freedesktop/ScreenSaver', '/ScreenSaver'];
const TIMEOUT = 1000;
const SANDBOXED_TIMEOUT = 10000;

function watchIdle({timeout = TIMEOUT, input = false, socket = null} = {}) {
  const argv = ['python3', fixture('clients', 'wayland', 'idleClient.py'), `${timeout}`, ...input ? ['--input'] : []];
  const process = spawn(argv, {env: through(socket), flags: Gio.SubprocessFlags.STDOUT_PIPE});
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
  const input = watchIdle({input: true});
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

async function checkShortTimeouts() {
  moveBy(5, 5);
  const watcher = watchIdle({timeout: 10});
  try {
    await pause(TIMEOUT * 0.7);
    require(!watcher.events.includes('idled'), 'apps cannot hear about idle times shorter than a second');
    await eventually(() => watcher.events.includes('idled'), 'apps that ask for a shorter idle time hear after a second', 3000);
  } finally {
    await stop(watcher.process);
  }
}

async function checkSandboxed() {
  const sandbox = await openSecurityContext('org.example.Passwords');
  moveBy(5, 5);
  const watcher = watchIdle({socket: sandbox.socket});
  try {
    await pause(SANDBOXED_TIMEOUT / 2);
    require(!watcher.events.includes('idled'), 'sandboxed apps cannot hear about idle times shorter than ten seconds');
    await eventually(() => watcher.events.includes('idled'), 'sandboxed apps hear when nobody has used the computer for ten seconds', SANDBOXED_TIMEOUT);
  } finally {
    await Promise.all([stop(watcher.process), stop(sandbox.process)]);
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
  await checkShortTimeouts();
  await checkSandboxed();
  await checkScreenSaver();
}
