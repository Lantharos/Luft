import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {capture, renderedFrame} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {darkened, unlock} from './lib/shield.js';
import {externalMonitor, prepareForSleep, screenOn, setLidClosed} from './lib/sleep.js';

const {require, eventually} = checks('waking');
const STAYS_ON = 2000;
const BLACK = '#000000';

const lockScreenShown = () => Main.screenShield.locked && Main.screenShield.active && !darkened();

async function painted() {
  const frame = await renderedFrame(global.display.get_monitor_geometry(global.display.get_primary_monitor()));
  return frame.share([BLACK], 8) < 0.5;
}

async function checkWoken(name) {
  await eventually(screenOn, 'opening the lid turns the screen on without a key press');
  await eventually(lockScreenShown, 'the lock screen shows without a key press');
  await pause(STAYS_ON);
  require(await screenOn() && lockScreenShown(), 'the screen stays on after waking');
  require(await painted(), 'the lock screen is painted after waking');
  await capture(name);
}

async function checkSleepWithLidClosed() {
  await setLidClosed(true);
  await prepareForSleep(true);
  await eventually(() => Main.screenShield.active, 'the screen locks before the computer sleeps');
  await eventually(async () => !await screenOn(), 'the screen turns off before the computer sleeps');
  await prepareForSleep(false);
  await setLidClosed(false);
  await checkWoken('lock-screen-after-sleep');
  await unlock();
}

async function checkWakeWhileLocking() {
  await setLidClosed(true);
  await prepareForSleep(true);
  await prepareForSleep(false);
  await setLidClosed(false);
  await checkWoken('lock-screen-after-short-sleep');
  await unlock();
}

async function checkLidWithMonitor() {
  require(await externalMonitor(), 'the session runs on an external monitor');
  await setLidClosed(true);
  await pause(STAYS_ON);
  require(await screenOn() && !Main.screenShield.active, 'closing the lid with an external monitor keeps the desktop on it');
  await setLidClosed(false);
  await pause(STAYS_ON);
  require(await screenOn() && !Main.screenShield.active, 'opening the lid again leaves the desktop as it was');
}

export async function run() {
  try {
    await checkSleepWithLidClosed();
    await checkWakeWhileLocking();
    await checkLidWithMonitor();
  } finally {
    await setLidClosed(false);
    if (Main.screenShield.locked) await unlock();
  }
}
