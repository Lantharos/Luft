import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {firstStyled, labelled, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {callLog} from '../system/lib/systemCalls.js';
import {withScheme} from '../apps/lib/palette.js';

const {require, eventually} = checks('app access');
const APP = 'spotify';
const QUESTION = 'Spotify wants to accept connections from other devices on this network';
const PROGRAM_QUESTION = 'python3 wants to accept connections from other devices on this network';

const opened = () => styled('kestrel-firewall-dialog').find(actor => actor.mapped) ?? null;

const listen = (kind: string, id: string) =>
  call('com.lantharos.Firewall1', '/com/lantharos/KestrelChecks/Firewall', 'com.lantharos.KestrelChecks.Firewall', 'Listen',
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

export async function run() {
  const calls = callLog();
  await listen('app', APP);
  const dialog = await eventually(opened, 'an app listening on the network asks once whether devices may connect');
  require(labelled(QUESTION, dialog), 'the question names the app');
  require(firstStyled('kestrel-dialog-app-icon', dialog)?.mapped, 'the question shows the app');
  require(labelled('Don’t allow', dialog), 'the question offers to keep the app unreachable');
  await capture('firewall-app-dark');
  await withScheme('light', async () => {
    await settled();
    await capture('firewall-app-light');
  });
  await captureCorners();
  click(require(labelled('Allow', dialog), 'the question offers to allow'));
  await eventually(() => calls().includes(`SetAppAccess app ${APP} home`), 'Allow lets devices on home networks connect');
  await eventually(() => !opened(), 'an answered question closes');

  await listen('program', 'python3');
  const program = await eventually(opened, 'a program outside an app is asked about by its name');
  require(labelled(PROGRAM_QUESTION, program), 'the question names the program');
  press(Clutter.KEY_Escape);
  await eventually(() => calls().includes('SetAppAccess program python3 blocked'), 'Escape keeps the program unreachable');
  await eventually(() => !opened(), 'a declined question closes');
}
