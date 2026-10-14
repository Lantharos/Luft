import Gio from 'gi://Gio';

import {call} from '../lib/dbus.js';
import {gjs, waitForWindow} from '../lib/processes.js';
import {pause} from '../lib/wait.js';
import {eventually, Setup} from './lib/driver.js';

const AT = {
  code: [690, 547],
  notNow: [560, 547],
  encrypt: [680, 547],
  kept: [70, 420],
  restart: [720, 547],
};
const HANDOFF = 5000;

async function checkSecureBoot(setup) {
  await setup.shot('secure-boot');
  await setup.click(AT.code, 'asking for the code shows it');
  await setup.called('EnrollSigningKey', 'the code comes from trustd, which asks shim to add the key');
  await setup.shot('secure-boot-code');
  await setup.click(AT.notNow, 'putting the key off moves on to encryption');
}

async function checkProtect(setup) {
  await setup.shot('protect');
  await setup.click(AT.encrypt, 'choosing encryption shows the recovery key');
  await setup.shot('protect-key');
  await setup.click(AT.kept, 'confirming the key was kept');
  await setup.click(AT.encrypt, 'encrypting moves on');
  await setup.called('TurnOnEncryption', 'encryption is turned on through trustd');
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

export async function checkFirstBoot(endSession) {
  const setup = new Setup();
  await setup.setPhase('first-boot');
  await setup.open();
  await checkSecureBoot(setup);
  await checkProtect(setup);
  await setup.shot('ready');
  setup.tap(AT.restart);
  await setup.called('installer FinishFirstBoot', 'finishing stops signing in automatically');
  await eventually(async () => (await setup.calls()).includes('Reboot'), 'encrypting needs a restart to finish');
  await checkHandoff(endSession);
}
