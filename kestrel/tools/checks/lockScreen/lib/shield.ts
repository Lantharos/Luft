import Clutter from 'gi://Clutter';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {named, shown, shownStyled, styled, textOf} from '../../lib/actors.js';
import {moveBy, press} from '../../lib/input/input.js';
import {settled, waitUntil} from '../../lib/wait.js';

export const darkened = () => styled('lightbox', Main.uiGroup).some(actor => actor.visible);
const promptShown = () => named('kestrel-lock-controls')?.opacity === 255 && shown(named('kestrel-lock-controls'));

const promptEntry = () => {
  const entry = shownStyled('login-dialog-prompt-entry');
  return entry instanceof St.Entry ? entry : null;
};

export const hint = () => {
  const label = shownStyled('login-dialog-hint');
  return label && textOf(label);
};

export async function lock() {
  Main.screenShield.lock(true);
  await waitUntil(() => Main.screenShield.active && darkened(), 'the locked screen fades out');
}

export async function wake() {
  moveBy(30, 30);
  await waitUntil(() => !darkened(), 'moving the pointer wakes the lock screen');
  await settled();
}

export async function lockAndWake() {
  await lock();
  await wake();
}

export async function showPrompt() {
  press(Clutter.KEY_space);
  await waitUntil(promptShown, 'a key shows the unlock prompt');
  await waitUntil(() => promptEntry()?.clutter_text.has_key_focus(), 'the password field takes the keyboard');
  await settled();
}

export async function unlock() {
  Main.screenShield.deactivate(false);
  await waitUntil(() => !Main.screenShield.locked, 'the screen unlocks');
}
