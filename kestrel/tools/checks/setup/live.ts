import Clutter from 'gi://Clutter';

import {NEW_RECOVERY_KEY, RECOVERY_WORD} from '../../fixtures/system/security/recoveryKeys.js';
import type {Point} from '../lib/input/input.js';
import {require, Setup} from './lib/driver.js';

const GB = 1e9;
const AT = {
  continue: [711, 547],
  alongside: [235, 191],
  whole: [235, 269],
  custom: [235, 347],
  back: [85, 547],
  keyboard: [400, 280],
  outside: [400, 110],
  install: [700, 547],
  writeDown: [648, 457],
  encrypt: [722, 547],
  confirm: [565, 336],
  name: [315, 214],
  password: [315, 361],
  repeat: [315, 434],
  restart: [690, 547],
  moreOptions: [560, 547],
  skip: [728, 547],
} satisfies Record<string, Point>;

async function checkNetwork(setup: Setup) {
  await setup.shot('network');
  await setup.click(AT.skip, 'skipping the network page moves on to the account');
}

async function checkAccount(setup: Setup) {
  await setup.click(AT.name, 'the name field takes focus');
  await setup.type('Ada Lovelace');
  await setup.click(AT.password, 'the password field takes focus');
  await setup.type('correct horse');
  await setup.click(AT.repeat, 'the second password field takes focus');
  await setup.type('correct horse');
  await setup.shot('account');
  await setup.click(AT.continue, 'the account is made while Luft copies');
  await setup.called('installer CreateAccount ada Ada Lovelace', 'the account gets a user name from the first name');
  const [regional] = await setup.requests();
  require(regional.hostname === 'ada-laptop' || regional.hostname === 'ada-computer', 'the computer is named after its owner');
}

async function checkInstallStarts(setup: Setup) {
  await setup.shot('protect');
  await setup.click(AT.writeDown, 'writing the recovery key down shows its words in a dialog');
  await setup.shot('protect-write-down');
  await setup.press(Clutter.KEY_Return, 'once the words are written down, the dialog asks for three of them');
  const prefix = RECOVERY_WORD.slice(0, 4);
  await setup.type(`${prefix} ${prefix} ${prefix}`);
  await setup.shot('protect-check');
  await setup.press(Clutter.KEY_Return, 'the right three words close the dialog and let Luft be encrypted');
  await setup.shot('protect-checked');
  await setup.click(AT.encrypt, 'encrypting asks to confirm');
  await setup.shot('protect-confirm');
  await setup.click(AT.confirm, 'confirming starts the install');
  const [request, regional] = await setup.requests();
  require(['default', 'nvidia'].includes(request.variant) && request.target.kind === 'alongside' && request.target.drive.endsWith('/nvme0n1') &&
    request.target.size > 300 * GB && request.target.size < 500 * GB, 'Luft is installed next to Windows with the size the bar shows');
  require(request.encryption?.recoveryKey === NEW_RECOVERY_KEY && request.encryption.passphrase === '',
    'Luft is encrypted with the recovery key shown, unlocking with the TPM');
  require(regional.keyboard.layout === 'de' && regional.timezone === 'Europe/Berlin' && regional.locale === 'en_US.UTF-8',
    'the installed system gets the keyboard, time zone and language chosen at the start');
}

async function checkFromMeet() {
  const setup = new Setup();
  await setup.useMeet(true);
  await setup.open();
  await setup.called('SetX11Keyboard at nodeadkeys', 'the keyboard layout Meet Luft noted becomes the live session’s');
  await setup.called('SetTimezone Europe/Vienna', 'the time zone Meet Luft noted becomes the live session’s');
  await setup.shot('welcome-meet');
  await setup.click(AT.keyboard, 'the keyboard list opens');
  await setup.type('custom');
  await setup.shot('welcome-keyboard-custom');
  await setup.click(AT.outside, 'clicking outside closes the list');
  await setup.click(AT.continue, 'continuing says Luft isn’t finished yet');
  await setup.click(AT.continue, 'continuing shows the room Meet Luft made');
  await setup.shot('destination-meet');
  await setup.click(AT.moreOptions, 'more options shows the other ways to install');
  await setup.shot('destination-meet-choices');
  await setup.click(AT.back, 'going back shows the room Meet Luft made again');
  await setup.click(AT.back, 'going back from the room shows the early note');
  await setup.click(AT.back, 'going back from the early note shows the first screen');
  await setup.shot('destination-meet-back');
  await setup.close();
  await setup.useMeet(false);
}

export async function checkLive() {
  await checkFromMeet();
  const setup = new Setup();
  await setup.open();
  await setup.called('SetX11Keyboard de nodeadkeys', 'the keyboard layout Windows used becomes the live session’s');
  await setup.called('SetTimezone Europe/Berlin', 'the time zone Windows used becomes the live session’s');
  await setup.shot('welcome');
  await setup.click(AT.keyboard, 'the keyboard list opens');
  await setup.type('dvorak');
  await setup.shot('welcome-keyboard');
  await setup.click(AT.outside, 'clicking outside closes the list');
  await setup.click(AT.continue, 'continuing says Luft isn’t finished yet');
  await setup.click(AT.continue, 'continuing shows where to install');
  await setup.shot('destination');
  await setup.click(AT.whole, 'choosing a whole drive lists the drives');
  await setup.shot('whole-drive');
  await setup.click(AT.back, 'going back shows the choices again');
  await setup.click(AT.custom, 'choosing custom offers Disks and the free space');
  await setup.shot('custom');
  await setup.click(AT.back, 'going back shows the choices again');
  await setup.click(AT.alongside, 'choosing Windows shows how to share its drive');
  await setup.shot('alongside');
  await setup.click(AT.install, 'installing asks whether to encrypt Luft');
  await checkInstallStarts(setup);
  await checkNetwork(setup);
  await checkAccount(setup);
  await setup.shot('copying');
  await setup.setStage('finished', 1);
  await setup.app.settle(() => true);
  await setup.shot('installed');
  setup.tap(AT.restart);
  await setup.called('Reboot', 'Restart now restarts the computer');
  await setup.close();
}
