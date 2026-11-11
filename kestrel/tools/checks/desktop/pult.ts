import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {StandInPult} from '../../fixtures/services/pult.js';
import {ScratchKeyring} from '../../fixtures/services/secretService.js';
import {descendants, shown, showsText, styled} from '../lib/actors.js';
import {freePorts} from '../lib/apps/ports.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press, rest} from '../lib/input/input.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {withApp} from '../apps/lib/apps.js';
import {show} from '../apps/settings/navigation.js';
import {closeStart, openStart, rows, search, titleOf} from '../start/search/results.js';
import {installBuilt, listed, request, rewrite, developmentFolder} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Pult');
const PULT = 'com.lantharos.Pult';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const ELEMENT = `extension-element:${PULT}/pult`;

type PageItem = {type: string; title?: string; label?: string; action?: string};

const element = () => descendants(global.stage).find(actor => actor.name === ELEMENT && actor.mapped) ?? null;
const popup = () => descendants(global.stage).find(actor => actor.name === 'kestrel-extension-popup' && actor.mapped) ?? null;
const mentions = (root: Clutter.Actor | null, text: string) => !!root && descendants(root).some(actor => actor instanceof St.Label && actor.mapped && actor.text.includes(text));
const bannerSays = (text: string) => styled('notification-banner', Main.uiGroup).filter(shown).some(banner => showsText(text, banner));

async function page(): Promise<PageItem[]> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [PULT]), '(s)')).deepUnpack<[string]>();
  return (JSON.parse(json) as {items: PageItem[]}[]).flatMap(section => section.items);
}

async function choose(label: string) {
  const button = (await page()).find(item => item.type === 'button' && item.label === label)!;
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [PULT, button.action!, new GLib.Variant('b', true)]));
}

async function checkSignedOut() {
  const mark = await eventually(element, 'Pult sits in the taskbar');
  await settled();
  click(mark);
  await eventually(() => mentions(popup(), 'Not signed in'), 'before signing in its pop-up offers to sign in');
  await capture('pult-signed-out');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'Escape closes it');
}

async function checkSigningIn(pult: StandInPult, keyring: ScratchKeyring) {
  await withApp('settings', [], async app => {
    let shown = await show(app, `extensions/${PULT.toLowerCase()}`);
    shown.save('pult-settings-signed-out');
    await choose('Sign in');
    await eventually(async () => (await page()).some(item => item.title === 'Confirm the code BCDF-GHJK in your browser'), 'signing in shows the code to confirm');
    shown = await app.changes(shown, 'Settings shows the code');
    shown.save('pult-settings-code');
    pult.approve();
    await eventually(async () => (await page()).some(item => item.title === 'Mara Lindqvist'), 'once confirmed it shows who is signed in');
    (await app.changes(shown, 'Settings shows who is signed in')).save('pult-settings-signed-in');
  });
  require(keyring.items.some(item => item.secret === 'pult_device_standin'), 'it keeps the token in the keyring');
  await eventually(() => mentions(element(), '9'), 'the taskbar counts what waits in every inbox');
  await eventually(() => bannerSays('Urgent in Support') && bannerSays('Refund failed for order 4821'), 'an urgent item shows as a notification');
  await capture('pult-urgent');
}

function clearNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

async function checkPopup() {
  clearNotifications();
  rest();
  click(element()!);
  const shownPopup = await eventually(() => mentions(popup(), '9 items waiting') && popup(), 'its pop-up says how much waits');
  require(mentions(shownPopup, 'Refund failed for order 4821') && mentions(shownPopup, 'Crashes'), 'with the urgent item and every inbox');
  await settled();
  await capture('pult-popup');
  press(Clutter.KEY_Escape);
  await eventually(() => !popup(), 'Escape closes it');
}

async function checkSearch() {
  await openStart();
  search('refund');
  await eventually(() => rows().some(row => titleOf(row) === 'Refund failed for order 4821'), 'Start finds Pult items');
  await capture('pult-search');
  closeStart();
}

async function checkSigningOut(pult: StandInPult, keyring: ScratchKeyring) {
  await choose('Sign out');
  await eventually(() => !pult.authorized && pult.requests.includes('DELETE /api/devices/current'), 'signing out signs this computer out of Pult');
  await eventually(() => !keyring.items.some(item => item.secret === 'pult_device_standin'), 'and forgets the token');
  await eventually(() => !mentions(element(), '9'), 'and the taskbar stops counting');
}

export async function run() {
  const keyring = new ScratchKeyring();
  require(await keyring.own(), 'a scratch keyring stands in for the Secret Service');
  const pult = new StandInPult(freePorts('pult').pult);
  try {
    await installBuilt(PULT);
    rewrite(GLib.build_filenamev([developmentFolder(PULT), 'extension.toml']), text => text.replace('"app.pult.sh"', `"127.0.0.1:${pult.port}"`));
    rewrite(GLib.build_filenamev([developmentFolder(PULT), 'extension.js']), text => text.replaceAll('https://app.pult.sh', pult.base));
    await request('Reload', PULT);
    await eventually(async () => (await listed(PULT))?.state === 'running', 'Pult runs once installed');
    await checkSignedOut();
    await checkSigningIn(pult, keyring);
    await checkPopup();
    await checkSearch();
    await checkSigningOut(pult, keyring);
  } finally {
    await request('Remove', PULT);
    pult.close();
    keyring.close();
  }
}
