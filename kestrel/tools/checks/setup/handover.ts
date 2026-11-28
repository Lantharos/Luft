import Clutter from 'gi://Clutter';

import {NEW_RECOVERY_KEY, RECOVERY_WORD} from '../../fixtures/system/security/recoveryKeys.js';
import {require, Setup} from './lib/driver.js';

const PASSPHRASE = 'correct horse battery';

export async function checkForSomeoneElse() {
  const setup = new Setup();
  await setup.open();
  await setup.choose('Continue', 'continuing says Luft isn’t finished yet');
  await setup.choose('Continue', 'continuing asks who the computer is for');
  await setup.click((await setup.app.find({role: 'button', text: 'Someone else'})), 'installing for someone else shows where to install');
  await setup.shot('for-someone-else-destination');
  require((await setup.app.all({text: 'Replace'})).length === 0, 'a computer for someone else can’t keep another system’s files and accounts');
  await setup.click(await setup.app.find({role: 'button', text: 'Windows'}), 'choosing Windows shows how to share its drive');
  await setup.choose('Install', 'installing asks to confirm, without asking about encryption');
  await setup.shot('for-someone-else-confirm');
  await setup.click(await setup.app.find({role: 'button', name: 'Install', within: {role: 'dialog'}}), 'confirming starts the install');
  const [request] = await setup.requests();
  require(request.forSomeoneElse === true && !request.encryption, 'Luft is installed for someone else, with no keys of whoever installs it');
  await setup.shot('for-someone-else-network');
  await setup.choose('Skip', 'skipping the network page goes straight to copying, without an account');
  await setup.shot('for-someone-else-copying');
  require(!(await setup.calls()).some(call => call.startsWith('installer CreateAccount')), 'no account is made for a computer that’s for someone else');
  await setup.setStage('finished', 1);
  await setup.app.settle(() => true);
  await setup.shot('for-someone-else-installed');
  setup.tap(await setup.app.find({role: 'button', name: 'Restart now'}));
  await setup.called('Reboot', 'Restart now restarts the computer');
  await setup.close();
}

export async function checkHandedOver() {
  const setup = new Setup();
  await setup.setPhase('handover');
  await setup.setSigningKey('enrolled');
  await setup.open();
  await setup.called('installer LeaveToOwner', 'showing that the computer is ready makes the next start its owner’s');
  await setup.app.find({role: 'button', name: 'Shut down'});
  await setup.shot('handed-over');
  setup.tap(await setup.app.find({role: 'button', name: 'Shut down'}));
  await setup.called('PowerOff', 'Shut down turns the computer off');
  await setup.close();
  await setup.setSigningKey('none');
}

async function fill(setup: Setup, label: string, text: string) {
  await setup.click(await setup.app.find({role: 'textbox', name: label}), `the ${label} field takes focus`);
  await setup.type(text);
}

export async function checkOwner() {
  const setup = new Setup();
  await setup.setPhase('unclaimed');
  await setup.open();
  await setup.shot('owner-welcome');
  await setup.choose('Get started', 'the welcome goes on to language, keyboard and time zone');
  await setup.shot('owner-region');
  await setup.choose('Continue', 'continuing says Luft isn’t finished yet');
  await setup.choose('Continue', 'continuing offers the internet');
  await setup.shot('owner-network');
  await setup.choose('Skip', 'skipping the network page moves on to the account');
  await fill(setup, 'Your name', 'Drita Krasniqi');
  await fill(setup, 'Password', 'correct horse');
  await fill(setup, 'Type it again', 'correct horse');
  await setup.shot('owner-account');
  await setup.choose('Continue', 'the account is kept until the computer is its owner’s');
  await setup.called('installer CreateAccount drita Drita Krasniqi', 'the account gets a user name from the first name');
  await setup.requests();
  await setup.shot('owner-protect');
  require((await setup.app.all({role: 'button', name: 'Don’t encrypt'})).length === 0, 'a drive that’s already encrypted can’t be left unencrypted');
  await setup.choose('Write it down', 'writing the recovery key down shows its words in a dialog');
  await setup.press(Clutter.KEY_Return, 'once the words are written down, the dialog asks for three of them');
  const prefix = RECOVERY_WORD.slice(0, 4);
  await setup.type(`${prefix} ${prefix} ${prefix}`);
  await setup.press(Clutter.KEY_Return, 'the right three words close the dialog');
  await fill(setup, 'Passphrase', PASSPHRASE);
  await fill(setup, 'Type it again', PASSPHRASE);
  await setup.shot('owner-protect-ready');
  setup.tap(await setup.app.find({role: 'button', name: 'Continue'}));
  await setup.called('installer Claim', 'continuing makes the computer its owner’s');
  const claimed = (await setup.requests()).at(-1);
  require(claimed?.recoveryKey === NEW_RECOVERY_KEY && claimed.passphrase === PASSPHRASE,
    'the drive gets the recovery key shown and the passphrase chosen in place of its temporary key');
  await setup.close();
  await setup.setPhase('live');
}
