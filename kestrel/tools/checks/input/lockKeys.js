import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {lockAndWake, showPrompt, unlock} from '../lockScreen/lib/shield.js';

const {require, eventually} = checks('lock key');
const keymap = global.stage.context.get_backend().get_default_seat().get_keymap();
const osd = () => Main.osdWindowManager._osdWindows[0];
const shows = label => osd().visible && osd().opacity === 255 && osd()._label.text === label;

async function hidden() {
  Main.osdWindowManager.hideAll();
  await eventually(() => !osd().visible, 'the notice hides');
}

async function toggle(key, label, isOn, on) {
  press(key);
  await eventually(() => isOn() === on && shows(label), `${label} shows on screen`);
}

async function checkNotices() {
  const caps = () => keymap.get_caps_lock_state();
  const num = () => keymap.get_num_lock_state();
  const numWas = num();
  await toggle(Clutter.KEY_Caps_Lock, 'Caps Lock on', caps, true);
  await capture('caps-lock-on-osd');
  await toggle(Clutter.KEY_Caps_Lock, 'Caps Lock off', caps, false);
  await capture('caps-lock-off-osd');
  await toggle(Clutter.KEY_Num_Lock, `Num Lock ${numWas ? 'off' : 'on'}`, num, !numWas);
  await capture(`num-lock-${numWas ? 'off' : 'on'}-osd`);
  await toggle(Clutter.KEY_Num_Lock, `Num Lock ${numWas ? 'on' : 'off'}`, num, numWas);
  await capture(`num-lock-${numWas ? 'on' : 'off'}-osd`);
  await hidden();
}

async function checkTurnedOff() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.media-keys'});
  settings.set_boolean('lock-key-notices', false);
  try {
    press(Clutter.KEY_Caps_Lock);
    await eventually(() => keymap.get_caps_lock_state(), 'Caps Lock turns on');
    await pause(300);
    require(!osd().visible, 'nothing shows once the notices are turned off');
    press(Clutter.KEY_Caps_Lock);
    await eventually(() => !keymap.get_caps_lock_state(), 'Caps Lock turns off');
  } finally {
    settings.reset('lock-key-notices');
  }
}

async function checkLockScreenWarning() {
  await lockAndWake();
  await showPrompt();
  try {
    press(Clutter.KEY_Caps_Lock);
    await eventually(() => shownStyled('caps-lock-warning-label')?.opacity === 255, 'the password field warns that Caps Lock is on');
    await capture('caps-lock-lock-screen');
    press(Clutter.KEY_Caps_Lock);
    await eventually(() => !keymap.get_caps_lock_state() && shownStyled('caps-lock-warning-label')?.opacity !== 255, 'the warning goes once Caps Lock is off');
  } finally {
    await unlock();
  }
  await hidden();
}

export async function run() {
  await checkNotices();
  await checkTurnedOff();
  await checkLockScreenWarning();
}
