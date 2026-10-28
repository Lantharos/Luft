import Clutter from 'gi://Clutter';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {showsText, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press, type} from '../lib/input/input.js';
import {captureFrame} from '../lib/screenshots.js';
import {hint, lockAndWake, showPrompt, unlock} from './lib/shield.js';

const {require, eventually} = checks('unlock');
const PASSWORD = 'correct horse';
const WRONG_PASSWORD = 'That password didn’t work';

const passwordReady = () => shownStyled('kestrel-auth-entry')?.reactive;

async function tryWrongPassword() {
  type('wrong horse');
  press(Clutter.KEY_Return);
  await eventually(() => showsText(WRONG_PASSWORD) && passwordReady(), 'a wrong password says so and asks again');
}

async function drawn() {
  const {pixbuf} = await captureFrame();
  const middle = Math.floor(pixbuf.get_height() / 2) * pixbuf.get_rowstride() + Math.floor(pixbuf.get_width() / 2) * pixbuf.get_n_channels();
  return !pixbuf.get_has_alpha() || pixbuf.get_pixels()[middle + 3] === 255;
}

export async function run() {
  await lockAndWake();
  try {
    require(await drawn(), 'the lock screen is drawn');
    await showPrompt();
    require(hint() === null, 'without enrolled fingers the unlock prompt only asks for the password');
    await tryWrongPassword();
    require(Main.screenShield.locked, 'a wrong password keeps the session locked');
    type(PASSWORD);
    press(Clutter.KEY_Return);
    await eventually(() => !Main.screenShield.locked, 'the password unlocks the session');
  } finally {
    if (Main.screenShield.locked) await unlock();
  }
}
