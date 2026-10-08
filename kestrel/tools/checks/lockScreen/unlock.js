import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {showsText, shownStyled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {press, type} from '../lib/input.js';
import {capture, captureFrame} from '../lib/screenshots.js';
import {hint, lockAndWake, showPrompt, unlock} from './lib/shield.js';

const {require, eventually} = checks('unlock');
const AUTHENTICATOR = ['com.lantharos.KestrelChecks.Authenticator', '/com/lantharos/KestrelChecks/Authenticator', 'com.lantharos.KestrelChecks.Authenticator'];
const PASSWORD = 'correct horse';
const INSTRUCTION = 'Place your finger on the fingerprint reader';
const WRONG_PASSWORD = 'That password didn’t work';

const authenticator = (method, value) => call(...AUTHENTICATOR, method, new GLib.Variant('(b)', [value]));
const passwordReady = () => shownStyled('login-dialog-prompt-entry')?.reactive;

async function tryWrongPassword() {
  type('wrong horse');
  press(Clutter.KEY_Return);
  await eventually(() => showsText(WRONG_PASSWORD) && passwordReady(), 'a wrong password says so and asks again');
}

async function touch(matched, until, label) {
  await eventually(async () => {
    await authenticator('Touch', matched);
    return until();
  }, label);
}

async function drawn() {
  const {pixbuf} = await captureFrame();
  const middle = Math.floor(pixbuf.get_height() / 2) * pixbuf.get_rowstride() + Math.floor(pixbuf.get_width() / 2) * pixbuf.get_n_channels();
  return !pixbuf.get_has_alpha() || pixbuf.get_pixels()[middle + 3] === 255;
}

async function checkFingerprint() {
  await authenticator('SetFingerprint', true);
  try {
    await lockAndWake();
    await showPrompt();
    await eventually(() => hint() === INSTRUCTION, 'the unlock prompt listens for a finger next to the password field');
    await capture('unlock-fingerprint');
    await tryWrongPassword();
    require(Main.screenShield.locked && hint() === INSTRUCTION, 'a wrong password leaves the fingerprint reader listening');
    await touch(false, () => hint() === 'Fingerprint not recognized', 'an unknown finger says so');
    await touch(true, () => !Main.screenShield.locked, 'a recognized finger unlocks the session');
  } finally {
    await authenticator('SetFingerprint', false);
    if (Main.screenShield.locked) await unlock();
  }
}

async function checkPassword() {
  await lockAndWake();
  try {
    require(await drawn(), 'the lock screen shows again after unlocking with a finger');
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

export async function run() {
  await checkFingerprint();
  await checkPassword();
}
