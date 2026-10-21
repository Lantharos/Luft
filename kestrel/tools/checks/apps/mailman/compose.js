import Clutter from 'gi://Clutter';

import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input/input.js';
import {settled} from '../../lib/wait.js';
import {changes} from '../lib/apps.js';
import {useScheme} from '../lib/palette.js';
import {address, ALIASES} from './stalwart.js';

const {require, eventually} = checks('Luft app');
const ARRIVAL = 30000;
const COMPOSER = {margin: 20, width: 620, height: 600, header: 48, row: 42, sidebar: 264};
const FROM_TRIGGER_X = 100;
const MENU = {gap: 6, padding: 6, heading: 26, item: 40, separator: 13};

function composer(app) {
  const {width, height} = app.window.get_frame_rect();
  const size = {width: Math.min(COMPOSER.width, width - COMPOSER.sidebar - 2 * COMPOSER.margin), height: Math.min(COMPOSER.height, height - 100)};
  const x = width - COMPOSER.margin - size.width;
  const y = height - COMPOSER.margin - size.height;
  return {x, y, ...size, fromRow: y + COMPOSER.header + COMPOSER.row / 2};
}

function menuItem(area, accounts, account, item) {
  const before = accounts.slice(0, account).reduce((total, items) => total + MENU.heading + items * MENU.item + MENU.separator, 0);
  const top = area.fromRow + 15 + MENU.gap + MENU.padding + before + MENU.heading;
  return [area.x + FROM_TRIGGER_X, top + MENU.item * (item + 0.5)];
}

async function saveBoth(app, area, name) {
  for (const scheme of ['light', 'dark']) {
    useScheme(scheme);
    await settled();
    (await app.settle(() => true, app.area(area))).save(`${name}-${scheme}`);
  }
  useScheme('light');
}

async function openComposer(app) {
  await changes(app, 'C opens the composer', () => press(Clutter.KEY_c));
  return composer(app);
}

async function chooseSender(app, area, accounts, account, item, label) {
  await changes(app, 'clicking From opens the sender menu', () => app.click([area.x + FROM_TRIGGER_X, area.fromRow]));
  await changes(app, label, () => app.click(menuItem(area, accounts, account, item)));
}

async function write(app, area, to, subject) {
  app.click([area.x + FROM_TRIGGER_X, area.fromRow + COMPOSER.row]);
  type(address(to));
  press(Clutter.KEY_Return);
  press(Clutter.KEY_Tab);
  type(subject);
  await settled();
}

async function sendFromAlias(app, server, accounts, {account, from, to, subject}) {
  const area = await openComposer(app);
  await chooseSender(app, area, accounts, account, 1, `choosing ${address(ALIASES[from])} shows it as the sender`);
  await write(app, area, to, subject);
  press(Clutter.KEY_Control_L, Clutter.KEY_Return);
  const alias = address(ALIASES[from]);
  const sentFromAlias = new RegExp(`^from:.*<${alias.replaceAll('.', '\\.')}>`, 'im');
  await eventually(() => sentFromAlias.test(server.received(to, subject)),
    `${to}'s server receives ${subject} from ${alias}`, ARRIVAL);
  require(!/^sender:/im.test(server.received(to, subject)), `mail sent from ${alias} carries no Sender header`);
}

async function checkCustomAddress(app, accounts) {
  const area = await openComposer(app);
  await saveBoth(app, area, 'mailman-composer');
  await changes(app, 'clicking From opens the sender menu', () => app.click([area.x + FROM_TRIGGER_X, area.fromRow]));
  await saveBoth(app, {...area, y: area.y - 20, height: area.height + 20}, 'mailman-composer-from');
  await changes(app, 'Another address lets you type the sender', () => app.click(menuItem(area, accounts, 0, accounts[0] - 1)));
  type('someone@example.org');
  await saveBoth(app, area, 'mailman-composer-custom');
  await changes(app, 'Escape closes the composer', () => press(Clutter.KEY_Escape));
}

export async function checkSending(app, server) {
  const accounts = [3, 3];
  await checkCustomAddress(app, accounts);
  await sendFromAlias(app, server, accounts, {account: 0, from: 'alice', to: 'bob', subject: 'alias-over-smtp'});
  await sendFromAlias(app, server, accounts, {account: 1, from: 'bob', to: 'alice', subject: 'alias-over-jmap'});
}
