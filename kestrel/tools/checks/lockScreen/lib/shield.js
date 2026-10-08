import Clutter from 'gi://Clutter';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named, shown, shownStyled, styled} from '../../lib/actors.js';
import {moveBy, press} from '../../lib/input.js';
import {settled, waitUntil} from '../../lib/wait.js';

const darkened = () => styled('lightbox', Main.uiGroup).some(actor => actor.visible);
const promptShown = () => named('kestrel-lock-controls')?.opacity === 255 && shown(named('kestrel-lock-controls'));

export const hint = () => shownStyled('login-dialog-hint')?.text ?? null;

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
  await waitUntil(() => shownStyled('login-dialog-prompt-entry')?.clutter_text.has_key_focus(), 'the password field takes the keyboard');
  await settled();
}

export async function unlock() {
  Main.screenShield.deactivate(false);
  await waitUntil(() => !Main.screenShield.locked, 'the screen unlocks');
}
