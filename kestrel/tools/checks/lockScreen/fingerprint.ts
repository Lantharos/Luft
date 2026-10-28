import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {getStyleVariant, Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {labelled, named, ofType, shown, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled, waitUntil} from '../lib/wait.js';
import {enroll, scan} from './lib/fingerprint.js';
import {hint, lockAndWake, promptEntry, showPrompt, unlock} from './lib/shield.js';
import {setLidClosed} from './lib/sleep.js';

const {require, eventually} = checks('fingerprint');
const PASSWORD = 'correct horse';
const SCANNING = 'Touch the fingerprint reader';
const UNAVAILABLE = 'Fingerprint isn’t available, enter your password';
const RETRIES = {
  'verify-retry-scan': 'Scan your finger again',
  'verify-swipe-too-short': 'Swipe was too short, try again',
  'verify-finger-not-centered': 'Center your finger and try again',
  'verify-remove-and-retry': 'Lift your finger and try again',
};
const remembered = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_state_dir(), 'kestrel', 'sign-in-method']));

const rememberedMethod = () => new TextDecoder().decode(remembered.load_contents(null)[1]);
const promptShown = () => shown(named('kestrel-auth'));
const usePassword = () => {
  const button = labelled('Use password instead');
  return shown(button) ? button : null;
};
const fingerprintFirst = () => !!usePassword() && !promptEntry();

async function touch(result: string, until: () => boolean, label: string) {
  await waitUntil(() => scan(result), 'the reader listens');
  await eventually(until, label);
}

async function lockShowingFingerprint() {
  await lockAndWake();
  await showPrompt();
  await eventually(() => fingerprintFirst() && hint() === SCANNING, 'with a finger enrolled the prompt asks only for the fingerprint');
}

async function unlockFromClock() {
  await lockAndWake();
  require(!promptShown(), 'the clock shows after waking');
  await touch('verify-match', () => !Main.screenShield.locked, 'a finger on the reader unlocks while the clock shows');
  require(!promptShown(), 'unlocking from the clock skips the prompt');
  require(rememberedMethod() === 'fingerprint', 'the fingerprint is remembered as the way to unlock');
}

async function showRetries() {
  await lockShowingFingerprint();
  await capture('unlock-fingerprint');
  for (const [result, text] of Object.entries(RETRIES))
    await touch(result, () => hint() === text, `the reader asking to ${result.slice('verify-'.length).replaceAll('-', ' ')} says so`);
  await touch('verify-no-match', () => hint() === 'Fingerprint not recognized', 'an unknown finger says so');
  require(Main.screenShield.locked && fingerprintFirst(), 'a finger the reader didn’t take keeps the prompt on the fingerprint');
}

async function typeToSwitch() {
  type('c');
  await eventually(() => promptEntry()?.text === 'c' && promptEntry()?.clutter_text.has_key_focus(),
    'typing switches to the password and keeps the first key');
  type(PASSWORD.slice(1));
  press(Clutter.KEY_Return);
  await eventually(() => !Main.screenShield.locked, 'the password typed after switching unlocks');
  require(rememberedMethod() === 'password', 'the password is remembered as the way to unlock');
}

async function rememberPassword() {
  await lockAndWake();
  await showPrompt();
  await eventually(() => promptEntry() && !usePassword() && shown(labelled('Use fingerprint')),
    'after unlocking with the password it asks for the password, with the fingerprint a click away');
  await touch('verify-match', () => !Main.screenShield.locked, 'a finger still unlocks while the password is asked for');
}

async function fallBackWhenAttemptsRunOut() {
  await lockShowingFingerprint();
  for (let attempt = 1; attempt <= 3; attempt++)
    await touch('verify-no-match', () => attempt === 3 ? showsText(UNAVAILABLE) : hint() === 'Fingerprint not recognized', `unknown finger ${attempt} of 3`);
  await eventually(() => promptEntry() && !usePassword(), 'after three unknown fingers the prompt falls back to the password');
  await capture('unlock-fingerprint-unavailable');
  ofType(labelled('Try fingerprint again'), St.Button).emit('clicked', 1);
  await eventually(() => fingerprintFirst() && hint() === SCANNING, 'the fingerprint can be tried again');
  await touch('verify-match', () => !Main.screenShield.locked, 'trying again unlocks with the fingerprint');
}

async function lidClosed() {
  await setLidClosed(true);
  try {
    await lockAndWake();
    await showPrompt();
    require(promptEntry() && !usePassword() && hint() === null, 'with the lid closed the prompt asks for the password only');
    require(!await scan('verify-match'), 'with the lid closed the reader isn’t listening');
    await setLidClosed(false);
    await eventually(() => fingerprintFirst() && hint() === SCANNING, 'opening the lid starts the reader again');
    await touch('verify-match', () => !Main.screenShield.locked, 'a finger unlocks once the lid is open');
  } finally {
    await setLidClosed(false);
  }
}

async function captureLight() {
  const styles = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const scheme = styles.get_string('color-scheme');
  styles.set_string('color-scheme', 'default');
  try {
    await eventually(() => getStyleVariant() === 'light', 'the shell turns light');
    await lockAndWake();
    await settled();
    await capture('lock-screen-light');
    await showPrompt();
    await eventually(() => fingerprintFirst(), 'the light prompt asks for the fingerprint');
    await settled();
    await capture('unlock-fingerprint-light');
    type('c');
    await eventually(() => promptEntry()?.text === 'c', 'typing switches the light prompt to the password');
    await settled();
    await capture('unlock-password-light');
    await unlock();
  } finally {
    styles.set_string('color-scheme', scheme);
  }
}

export async function run() {
  await enroll(GLib.get_user_name(), ['right-index-finger']);
  try {
    await unlockFromClock();
    await showRetries();
    await typeToSwitch();
    await rememberPassword();
    await fallBackWhenAttemptsRunOut();
    await lidClosed();
    await captureLight();
  } finally {
    await enroll(GLib.get_user_name(), []);
    if (Main.screenShield.locked) await unlock();
  }
}
