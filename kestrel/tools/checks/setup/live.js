import {require, Setup} from './lib/driver.js';

const GB = 1e9;
const AT = {
  continue: [711, 547],
  alongside: [235, 191],
  whole: [235, 269],
  custom: [235, 425],
  back: [85, 547],
  keyboard: [400, 280],
  install: [700, 547],
  confirm: [565, 346],
  skip: [730, 547],
  name: [315, 222],
  password: [315, 369],
  repeat: [315, 442],
  restart: [690, 547],
};

async function checkAccount(setup) {
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

async function checkInstallStarts(setup) {
  await setup.click(AT.confirm, 'confirming starts the install');
  const [request, regional] = await setup.requests();
  require(['default', 'nvidia'].includes(request.variant) && request.target.kind === 'alongside' && request.target.drive.endsWith('/nvme0n1') &&
    request.target.size > 300 * GB && request.target.size < 500 * GB, 'Luft is installed next to Windows with the size the bar shows');
  require(regional.keyboard.layout === 'de' && regional.timezone === 'Europe/Berlin' && regional.locale === 'en_US.UTF-8',
    'the installed system gets the keyboard, time zone and language chosen at the start');
}

export async function checkLive() {
  const setup = new Setup();
  await setup.open();
  await setup.called('SetX11Keyboard de nodeadkeys', 'the keyboard layout Windows used becomes the live session’s');
  await setup.called('SetTimezone Europe/Berlin', 'the time zone Windows used becomes the live session’s');
  await setup.shot('welcome');
  await setup.click(AT.keyboard, 'the keyboard list opens');
  await setup.type('dvorak');
  await setup.shot('welcome-keyboard');
  await setup.click(AT.keyboard, 'clicking outside closes the list');
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
  await setup.click(AT.install, 'installing asks to confirm');
  await setup.shot('alongside-confirm');
  await checkInstallStarts(setup);
  await setup.shot('network');
  await setup.click(AT.skip, 'skipping the network asks for an account');
  await checkAccount(setup);
  await setup.shot('copying');
  await setup.setStage('finished', 1);
  await setup.app.settle(() => true);
  await setup.shot('installed');
  setup.tap(AT.restart);
  await setup.called('Reboot', 'Restart now restarts the computer');
  await setup.close();
}
