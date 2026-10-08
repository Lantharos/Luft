import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {checks} from '../lib/check.js';
import {moveBy} from '../lib/input.js';
import {pause} from '../lib/wait.js';
import {startSessionClient} from './lib/sessionClient.js';
import {callLog, seenCalls, takeCalls} from './lib/systemCalls.js';

const {require, eventually} = checks('power');
const SCREEN_BLANK_DELAY = 20;
const SUSPEND_DELAY = 12;
const INHIBITED_SUSPEND_DELAY = 2;
const POWER_KEYS = 'Inhibit handle-power-key:handle-suspend-key:handle-hibernate-key block';

const wake = () => moveBy(3, 3);
const notified = summary => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === summary));

async function checkIdle(power) {
  const calls = callLog();
  power.set_string('sleep-inactive-ac-type', 'suspend');
  power.set_int('sleep-inactive-ac-timeout', SUSPEND_DELAY);
  wake();
  await eventually(() => notified('Suspending soon'), 'a notification warns before the computer suspends');
  await eventually(() => Main.brightnessManager.dimming, 'the screen dims after half the screen blank delay', (SCREEN_BLANK_DELAY / 2 + 2) * 1000);
  await eventually(() => calls().includes('Suspend'), 'the computer suspends after the idle time', (SUSPEND_DELAY - SCREEN_BLANK_DELAY / 2 + 2) * 1000);
  wake();
  await eventually(() => !Main.brightnessManager.dimming && !notified('Suspending soon'), 'using the computer brings the brightness back');
}

async function checkInhibited(power) {
  power.set_int('sleep-inactive-ac-timeout', INHIBITED_SUSPEND_DELAY);
  await startSessionClient('--inhibit');
  takeCalls();
  wake();
  await pause((INHIBITED_SUSPEND_DELAY + 1) * 1000);
  require(!takeCalls().includes('Suspend') && !notified('Suspending soon'), 'apps that keep the session awake hold off suspending');
}

export async function run() {
  const startup = seenCalls();
  require(startup.includes('Inhibit sleep delay') && startup.includes('Inhibit handle-lid-switch block'),
    'the session gets a moment to lock before sleeping and decides lid closing itself');
  require(startup.includes(POWER_KEYS), 'the desktop decides what the power keys do');

  const power = new Gio.Settings({schema_id: 'com.lantharos.kestrel.power'});
  const session = new Gio.Settings({schema_id: 'org.gnome.desktop.session'});
  try {
    session.set_uint('idle-delay', SCREEN_BLANK_DELAY);
    await checkIdle(power);
    await checkInhibited(power);
  } finally {
    for (const key of ['sleep-inactive-ac-type', 'sleep-inactive-ac-timeout']) power.reset(key);
    session.reset('idle-delay');
    wake();
  }
}
