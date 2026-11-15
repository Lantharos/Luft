import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {POLKIT_PASSWORD} from '../../fixtures/auth/polkitSession.js';
import {answerable, descendants, labelled, named, shown, shownStyled, showsText, textOf} from '../lib/actors.js';
import {withScheme} from '../apps/lib/palette.js';
import {checks} from '../lib/check.js';
import {click, press, type} from '../lib/input/input.js';
import {capture, output, screenshot} from '../lib/screenshots.js';
import {pause, settled, within} from '../lib/wait.js';
import {enroll, scan} from '../lockScreen/lib/fingerprint.js';
import {ask, myUid, type Outcome, type Request, withStandInHelper} from './lib/polkit.js';

const {require, eventually} = checks('administrator prompt');
const DIALOG = 'polkit-dialog';
const SCANNING = 'Touch the fingerprint reader';
const NOT_RECOGNIZED = 'Fingerprint not recognized';
const UNAVAILABLE = 'Fingerprint isn’t available, enter your password';
const WRONG = 'That password didn’t work';
const TINTED = 400;
const ANSWERED = 5000;
const CHECKED = 600;
const THEO = 2002;
const INES = 2003;

const dialog = () => shownStyled(DIALOG);
const entry = () => descendants(dialog() ?? global.stage).find((actor): actor is St.PasswordEntry => actor instanceof St.PasswordEntry && shown(actor)) ?? null;
const hint = () => {
  const label = dialog() && descendants(dialog()!).find(actor => actor instanceof St.Widget && actor.has_style_class_name('kestrel-auth-hint'));
  return label && shown(label) ? textOf(label) : null;
};
const button = (label: string) => {
  const found = dialog() && labelled(label, dialog()!);
  return shown(found) ? found as St.Button : null;
};
const fingerprintShown = () => !entry() && !!button('Use password instead');
const glyphFirst = () => hint() === SCANNING && fingerprintShown();
const focused = () => entry()?.clutter_text.has_key_focus();

async function opened(request: Request = {}) {
  const outcome = ask(request);
  await eventually(dialog, 'Kestrel asks for administrator permission');
  await eventually(() => answerable(DIALOG), 'the prompt takes input after a moment');
  return {outcome};
}

async function touch(result: string, until: () => unknown, label: string) {
  await eventually(() => scan(result), 'the reader listens');
  await eventually(until, label);
}

async function settledCapture(name: string) {
  await settled();
  await capture(name);
}

async function captureNow(name: string) {
  GLib.file_set_contents(output(name), (await screenshot()).toArray());
}

async function finished(outcome: Promise<Outcome>, expected: Outcome, label: string) {
  require(await within(outcome, ANSWERED, label) === expected, label);
  await eventually(() => !dialog(), 'the prompt goes away');
}

async function fingerprintFirst(scheme: string) {
  const {outcome} = await opened();
  await eventually(glyphFirst, 'with a finger enrolled the prompt leads with the fingerprint and hides the password');
  require(button('Use password instead')!.has_key_focus(), 'the quiet password link takes the keyboard');
  await settledCapture(`polkit-fingerprint-${scheme}`);
  await touch('verify-no-match', () => hint() === NOT_RECOGNIZED, 'an unknown finger says so');
  await pause(TINTED);
  await captureNow(`polkit-fingerprint-failed-${scheme}`);
  require(!entry(), 'an unknown finger keeps the prompt on the fingerprint');
  type('c');
  await eventually(() => entry()?.text === 'c' && focused(), 'typing switches to the password and keeps the first key');
  await settledCapture(`polkit-password-switched-${scheme}`);
  click(button('Use fingerprint')!);
  await eventually(fingerprintShown, 'the fingerprint is a click away from the password');
  click(button('Use password instead')!);
  await eventually(() => focused() && entry()!.text === '', 'Use password instead focuses an empty password field');
  type('wrong horse');
  press(Clutter.KEY_Return);
  await eventually(() => showsText(WRONG) && entry()?.text === '' && entry()?.reactive, 'a wrong password says so and asks again');
  await settledCapture(`polkit-wrong-password-${scheme}`);
  await touch('verify-match', () => true, 'the fingerprint still works while the password is asked');
  await finished(outcome, 'authorized', 'a finger allows the change while the password field shows');
}

async function recognized() {
  const {outcome} = await opened();
  await eventually(glyphFirst, 'the prompt asks for the fingerprint again');
  await eventually(() => scan('verify-match'), 'the reader listens');
  await eventually(() => dialog() && !dialog()!.reactive, 'a known finger holds the prompt for its check mark');
  await pause(CHECKED);
  await captureNow('polkit-fingerprint-recognized-dark');
  await finished(outcome, 'authorized', 'a known finger allows the change');
}

async function attemptsRunOut() {
  const {outcome} = await opened();
  await eventually(glyphFirst, 'the prompt leads with the fingerprint');
  for (let attempt = 1; attempt <= 3; attempt++)
    await touch('verify-no-match', () => attempt === 3 ? showsText(UNAVAILABLE) : hint() === NOT_RECOGNIZED, `unknown finger ${attempt} of 3`);
  await eventually(() => focused() && button('Try fingerprint again'), 'after three unknown fingers the prompt falls back to the password, and says why');
  await settledCapture('polkit-fingerprint-unavailable-dark');
  click(button('Try fingerprint again')!);
  await eventually(glyphFirst, 'the fingerprint can be tried again');
  click(button('Use password instead')!);
  await eventually(focused, 'the password field takes the keyboard');
  type(POLKIT_PASSWORD);
  press(Clutter.KEY_Return);
  await finished(outcome, 'authorized', 'the password allows the change');
}

async function passwordOnly(scheme: string) {
  const {outcome} = await opened();
  await eventually(() => focused() && !button('Use fingerprint') && hint() === null, 'without a finger the prompt asks for the password only');
  require(!button('Allow')?.reactive, 'Allow waits for a password');
  type('correct');
  await eventually(() => button('Allow')?.reactive, 'Allow takes a typed password');
  await settledCapture(`polkit-password-${scheme}`);
  type(POLKIT_PASSWORD.slice('correct'.length));
  await eventually(() => entry()?.text === POLKIT_PASSWORD, 'the whole password is typed');
  click(button('Allow')!);
  await finished(outcome, 'authorized', 'Allow sends the password');
}

async function administrators() {
  const {outcome} = await opened({uids: [THEO, INES]});
  await eventually(() => button('Theo Brandt')?.checked && button('Ines Okafor') && focused(),
    'with several administrators the prompt asks the first and offers the others');
  await settledCapture('polkit-administrators-dark');
  click(button('Ines Okafor')!);
  await eventually(() => button('Ines Okafor')?.checked && !button('Theo Brandt')?.checked && focused(), 'another administrator can be chosen');
  type(POLKIT_PASSWORD);
  press(Clutter.KEY_Return);
  await finished(outcome, 'authorized', 'the chosen administrator’s password allows the change');
}

async function cancelled() {
  const {outcome} = await opened({uids: [myUid()]});
  await eventually(glyphFirst, 'the prompt leads with the fingerprint');
  press(Clutter.KEY_Escape);
  await finished(outcome, 'dismissed', 'Escape cancels the request');
  require(!await scan('verify-match'), 'cancelling stops the reader');
}

export async function run() {
  await withStandInHelper(async () => {
    await enroll(GLib.get_user_name(), ['right-index-finger']);
    try {
      await fingerprintFirst('dark');
      await recognized();
      await attemptsRunOut();
      await cancelled();
      await withScheme('light', () => fingerprintFirst('light'));
    } finally {
      await enroll(GLib.get_user_name(), []);
    }
    await passwordOnly('dark');
    await withScheme('light', () => passwordOnly('light'));
    await administrators();
  });
  require(!named('kestrel-auth-use-password'), 'no prompt is left behind');
}
