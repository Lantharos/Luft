import Clutter from 'gi://Clutter';

import type {LuftApp} from '../../lib/apps/luftApp.js';
import {checks} from '../../lib/check.js';
import type {Box} from '../../lib/apps/probe.js';
import {press, type} from '../../lib/input/input.js';
import {settled} from '../../lib/wait.js';
import {changes, type Region} from '../lib/apps.js';
import {withScheme} from '../lib/palette.js';
import {address, ALIASES, type MailServer} from './stalwart.js';

const {require, eventually} = checks('Luft app');
const ARRIVAL = 30000;
const SENDER = {role: 'button', name: 'Send from'};

interface Sending {
  from: string;
  to: string;
  subject: string;
}

async function saveBoth(app: LuftApp, area: Region, name: string) {
  for (const scheme of ['light', 'dark'] as const) {
    await withScheme(scheme, async () => {
      await settled();
      (await app.settle(() => true, app.area(area))).save(`${name}-${scheme}`);
    });
  }
}

async function openComposer(app: LuftApp): Promise<Box> {
  await changes(app, 'C opens the composer', () => press(Clutter.KEY_c));
  return app.find({role: 'dialog'});
}

async function chooseSender(app: LuftApp, sender: string, label: string) {
  await changes(app, 'clicking From opens the sender menu', async () => app.click(await app.find(SENDER)));
  await changes(app, label, async () => app.click(await app.find({text: sender})));
}

async function write(app: LuftApp, to: string, subject: string) {
  app.click(await app.find({role: 'textbox', name: 'To'}));
  type(address(to));
  press(Clutter.KEY_Return);
  press(Clutter.KEY_Tab);
  type(subject);
  await settled();
}

async function sendFromAlias(app: LuftApp, server: MailServer, {from, to, subject}: Sending) {
  await openComposer(app);
  await chooseSender(app, address(ALIASES[from]), `choosing ${address(ALIASES[from])} shows it as the sender`);
  await write(app, to, subject);
  press(Clutter.KEY_Control_L, Clutter.KEY_Return);
  const alias = address(ALIASES[from]);
  const sentFromAlias = new RegExp(`^from:.*<${alias.replaceAll('.', '\\.')}>`, 'im');
  await eventually(() => sentFromAlias.test(server.received(to, subject)),
    `${to}'s server receives ${subject} from ${alias}`, ARRIVAL);
  require(!/^sender:/im.test(server.received(to, subject)), `mail sent from ${alias} carries no Sender header`);
}

async function checkCustomAddress(app: LuftApp) {
  const area = await openComposer(app);
  await saveBoth(app, area, 'mailman-composer');
  await changes(app, 'clicking From opens the sender menu', async () => app.click(await app.find(SENDER)));
  await saveBoth(app, {...area, y: area.y - 20, height: area.height + 20}, 'mailman-composer-from');
  await changes(app, 'Another address lets you type the sender', async () => app.click(await app.find({text: 'Another address…', nth: 0})));
  type('someone@example.org');
  await saveBoth(app, area, 'mailman-composer-custom');
  await changes(app, 'Escape closes the composer', () => press(Clutter.KEY_Escape));
}

export async function checkSending(app: LuftApp, server: MailServer) {
  await checkCustomAddress(app);
  await sendFromAlias(app, server, {from: 'alice', to: 'bob', subject: 'alias-over-smtp'});
  await sendFromAlias(app, server, {from: 'bob', to: 'alice', subject: 'alias-over-jmap'});
}
