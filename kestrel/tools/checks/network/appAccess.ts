import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type St from 'gi://St';

import {answerable, firstStyled, labelled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press, type} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {callLog} from '../system/lib/systemCalls.js';
import {withScheme} from '../apps/lib/palette.js';

const {require, eventually} = checks('app access');
const APP = 'spotify';
const DIALOG = 'kestrel-firewall-dialog';
const QUESTION = 'Spotify wants to accept connections from other devices on this network';
const PROGRAM_QUESTION = 'python3 wants to accept connections from other devices on this network';
const FLAPS = 8;

const shownDialogs = () => styled(DIALOG).filter(actor => actor.mapped);
const opened = () => shownDialogs()[0] ?? null;

const control = (method: string, kind: string, id: string) =>
  call('com.lantharos.Firewall1', '/com/lantharos/KestrelChecks/Firewall', 'com.lantharos.KestrelChecks.Firewall', method,
    new GLib.Variant('(ss)', [kind, id]), null, {connection: Gio.DBus.system});

async function captureCorners() {
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  kestrel.set_boolean('rounded-window-corners', false);
  try {
    await capture('firewall-app-square');
  } finally {
    kestrel.reset('rounded-window-corners');
  }
}

async function checkEarlyInput(dialog: St.Widget, answered: () => boolean) {
  require(!answerable(DIALOG), 'the question has only just shown');
  press(Clutter.KEY_Return);
  click(require(labelled('Allow', dialog), 'the question offers to allow'));
  await pause(200);
  require(!answered() && opened() === dialog, 'keys and clicks as the question shows don’t answer it');
}

async function checkFlapping(dialog: St.Widget) {
  for (let flap = 0; flap < FLAPS; flap++) {
    await control('Withdraw', 'app', APP);
    await control('Listen', 'app', APP);
  }
  await control('Withdraw', 'app', APP);
  await settled();
  require(opened() === dialog && shownDialogs().length === 1, 'the question stays, once, while the app starts and stops listening');
}

async function checkStaysUp(dialog: St.Widget, answered: () => boolean) {
  await eventually(() => answerable(DIALOG), 'the question takes input after a moment');
  press(Clutter.KEY_Escape);
  click([8, 8]);
  type('typing');
  await settled();
  require(!answered() && opened() === dialog, 'Escape, a click elsewhere and typing leave the question up');
}

export async function run() {
  const calls = callLog();
  const answered = () => calls().some(made => made.startsWith('SetAppAccess'));
  await control('Listen', 'app', APP);
  const dialog = await eventually(opened, 'an app listening on the network asks whether devices may connect');
  await checkEarlyInput(dialog, answered);
  require(labelled(QUESTION, dialog), 'the question names the app');
  require(firstStyled('kestrel-dialog-app-icon', dialog)?.mapped, 'the question shows the app');
  require(labelled('Don’t allow', dialog), 'the question offers to keep the app unreachable');
  await checkFlapping(dialog);
  await checkStaysUp(dialog, answered);
  await capture('firewall-app-dark');
  await withScheme('light', async () => {
    await settled();
    await capture('firewall-app-light');
  });
  await captureCorners();
  click(require(labelled('Allow', dialog), 'the question offers to allow'));
  await eventually(() => calls().includes(`SetAppAccess app ${APP} home`), 'Allow lets devices on home networks connect');
  await eventually(() => !opened(), 'an answered question closes');

  await control('Listen', 'program', 'python3');
  const program = await eventually(opened, 'a program outside an app is asked about by its name');
  require(labelled(PROGRAM_QUESTION, program), 'the question names the program');
  await eventually(() => answerable(DIALOG), 'the program’s question takes input after a moment');
  const allow = require(labelled('Allow', program), 'the question offers to allow');
  press(Clutter.KEY_Tab);
  await eventually(() => global.stage.key_focus === allow, 'Tab reaches Allow');
  press(Clutter.KEY_Tab);
  await eventually(() => global.stage.key_focus !== allow, 'Tab moves on to Don’t allow');
  press(Clutter.KEY_Return);
  await eventually(() => calls().includes('SetAppAccess program python3 blocked'), 'Enter on Don’t allow keeps the program unreachable');
  await eventually(() => !opened(), 'a declined question closes');
}
