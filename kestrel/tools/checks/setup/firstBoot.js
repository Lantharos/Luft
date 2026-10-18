import Gio from 'gi://Gio';

import {call} from '../lib/dbus.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {eventually, require, Setup} from './lib/driver.js';

const AT = {
  back: [85, 547],
  code: [690, 547],
  later: [560, 547],
  encrypt: [680, 547],
  kept: [70, 420],
  addFingerprint: [690, 547],
  continue: [722, 547],
  restart: [720, 547],
};
const HANDOFF = 5000;

async function checkSecureBoot(setup) {
  await setup.shot('secure-boot');
  await setup.click(AT.code, 'asking for the code shows it');
  await setup.called('EnrollSigningKey', 'the code comes from trustd, which asks shim to add the key');
  await setup.shot('secure-boot-code');
  await setup.click(AT.later, 'restarting later moves on to encryption');
}

async function checkProtect(setup) {
  await setup.shot('protect');
  await setup.click(AT.encrypt, 'choosing encryption shows the recovery key');
  await setup.shot('protect-key');
  await setup.click(AT.kept, 'confirming the key was kept');
  await setup.click(AT.encrypt, 'encrypting moves on');
  await setup.called('TurnOnEncryption', 'encryption is turned on through trustd');
}

async function released(setup, times, label) {
  await eventually(async () => (await setup.calls()).filter(call => call === 'fingerprint Release').length === times, label);
  await setup.app.settle(() => true);
}

async function checkFingerprint(setup) {
  await setup.shot('fingerprint');
  await setup.click(AT.addFingerprint, 'adding a fingerprint starts scanning');
  await setup.called('fingerprint EnrollStart right-index-finger', 'the right index finger is tried first');
  await released(setup, 1, 'the reader is released once it says Windows already saved the finger');
  await setup.shot('fingerprint-duplicate');
  await setup.click(AT.back, 'going back from the refused finger shows the finger choice again');
  await setup.shot('fingerprint-back');
  await setup.click(AT.back, 'going back from the finger choice shows the encryption already set up');
  await setup.shot('protect-staged');
  await setup.click(AT.continue, 'continuing from the set up encryption returns to fingerprints');
  await setup.click(AT.addFingerprint, 'adding a fingerprint starts scanning');
  await setup.called('fingerprint EnrollStart left-index-finger', 'the next finger is offered after the refused one');
  await released(setup, 2, 'the reader is released once the finger is added');
  await setup.shot('fingerprint-added');
  await setup.click(AT.continue, 'continuing moves on');
}

async function checkHandoff(endSession) {
  gjs('clients/window.js', [], {env: {GDK_BACKEND: 'x11'}});
  await waitForWindow('Kestrel window check', 'an X11 window is open next to setup when it finishes');
  await endSession();
  await call('com.lantharos.Kestrel.Setup', '/com/lantharos/Kestrel/Setup', 'com.lantharos.Kestrel.Setup', 'Finish', null, null,
    {connection: Gio.DBus.session});
  await pause(HANDOFF);
  throw new Error('Kestrel kept running after setup finished');
}

async function checkKeyAlreadyTrusted() {
  const setup = new Setup();
  await setup.setSigningKey('enrolled');
  await setup.open();
  await setup.click(AT.encrypt, 'setup opens on encryption when the computer already trusts Luft');
  require(!(await setup.calls()).includes('EnrollSigningKey'), 'no code is asked for when the computer already trusts Luft');
  await setup.shot('first-boot-trusted');
  await setup.close();
  await setup.setSigningKey('none');
}

export async function checkFirstBoot(endSession) {
  const setup = new Setup();
  await setup.setPhase('first-boot');
  await checkKeyAlreadyTrusted();
  await setup.open();
  await checkSecureBoot(setup);
  await checkProtect(setup);
  await checkFingerprint(setup);
  await setup.shot('ready');
  setup.tap(AT.restart);
  await setup.called('installer FinishFirstBoot', 'finishing tells the installer setup is done');
  await eventually(async () => (await setup.calls()).includes('Reboot'), 'encrypting needs a restart to finish');
  await checkHandoff(endSession);
}
