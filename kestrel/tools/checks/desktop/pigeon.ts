import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, shown, showsText, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {centerOf, click, drag, press as pressKey, type as typeText} from '../lib/input/input.js';
import {scratch} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {settled} from '../lib/wait.js';
import {withApp} from '../apps/lib/apps.js';
import {squareCorners} from '../apps/lib/corners.js';
import {exists} from '../apps/lib/files.js';
import {withScheme} from '../apps/lib/palette.js';
import {show} from '../apps/settings/navigation.js';
import {installBuilt, listed, request, setSetting} from '../extensions/lib/extensions.js';
import {certificate, type FileOffer, PHONE, PHONE_PIN, Phone} from './pigeon/phone.js';
import {checkRover} from './pigeon/rover.js';
import {checkFirstLayout, checkIcon} from './pigeon/taskbar.js';

const {require, eventually} = checks('Pigeon');
const PIGEON = 'com.lantharos.Pigeon';
const ELEMENT = `extension-element:${PIGEON}/pigeon`;
const PHONE_PORT = 53399;
const PHONE_FOUND_MS = 20000;
const FIRST_ENTRY: [number, number] = [330, 104];
const SWITCH = 'Let nearby devices send to ';
const encoder = new TextEncoder();

const popups = () => descendants(global.stage).filter(actor => actor.name === 'kestrel-extension-popup' && actor.mapped);
const popupShowing = (text: string) => popups().find(popup => showsText(text, popup)) ?? null;
const startsWith = (prefix: string) => (actor: Clutter.Actor) => actor instanceof St.Label && actor.mapped && actor.text.startsWith(prefix);
const popupStarting = (prefix: string) => popups().find(popup => descendants(popup).some(startsWith(prefix))) ?? null;
const element = () => descendants(global.stage).find(actor => actor.name === ELEMENT && actor.mapped) ?? null;
const named = (actor: Clutter.Actor, name: string) => actor.accessible_name === name || actor.accessible_name?.startsWith(`${name}, `);
const button = (root: Clutter.Actor, name: string) =>
  descendants(root).find(actor => actor instanceof St.Button && named(actor, name) && actor.mapped) as St.Button | undefined;
const entry = (root: Clutter.Actor) => descendants(root).find(actor => actor instanceof St.Entry && actor.mapped) as St.Entry;

/** Clicks a button once its pop-up stopped moving, so windows coming and going don't take the click. */
async function press(popup: Clutter.Actor, name: string) {
  await settled();
  click(button(popup, name)!);
}

async function typeInto(popup: Clutter.Actor, text: string) {
  await settled();
  const field = entry(popup);
  field.grab_key_focus();
  typeText(text);
  await eventually(() => field.text === text, `typing ${text} fills the field`);
}
const bannerSays = (text: string) => styled('notification-banner', Main.uiGroup).filter(shown).some(banner => showsText(text, banner));
const INBOX = () => scratch('pigeon', 'Inbox');
const received = (name: string) => GLib.build_filenamev([INBOX(), name]);
const STORAGE = () => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${PIGEON}.json`]);
const read = (path: string) => GLib.file_get_contents(path)[1];
const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);

function clearNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

function clipboardText(): Promise<string | null> {
  return new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));
}

const clipboardTypes = () => global.display.get_selection().get_mimetypes(Meta.SelectionType.SELECTION_CLIPBOARD);

function bytes(length: number, seed: number): Uint8Array {
  return Uint8Array.from({length}, (_, index) => (index * 31 + seed) % 251);
}

const file = (id: string, fileName: string, size: number, fileType = 'application/octet-stream'): FileOffer => ({id, fileName, size, fileType});
const text = (message: string): FileOffer => ({id: 'text', fileName: 'message.txt', size: encoder.encode(message).length, fileType: 'text/plain', preview: message});

async function openPanel(timeout?: number) {
  if (popupStarting(SWITCH)) pressKey(Clutter.KEY_Escape);
  await eventually(() => !popupStarting(SWITCH), 'the panel is closed');
  click(await eventually(element, 'Pigeon sits in the taskbar'));
  return eventually(() => {
    const panel = popupShowing(PHONE);
    return panel && button(panel, PHONE) && panel;
  }, 'its panel lists the phone nearby', timeout);
}

async function checkSending(phone: Phone) {
  const panel = await openPanel();
  require(descendants(panel).some(startsWith("Let nearby devices send to Mara’s Laptop")), 'it says what other devices call this computer');
  await settled();
  await capture('pigeon-panel');
  click(button(panel, PHONE)!);
  const device = await eventually(() => popupShowing('Text or a link'), 'picking the phone offers files, a folder and text');
  await typeInto(device, 'Dinner at 8?');
  await eventually(() => button(device, 'Send text')?.reactive, 'typing something lets it be sent');
  click(button(device, 'Send text')!);
  await eventually(() => phone.offers.some(offer => Object.values(offer.files)[0]?.preview === 'Dinner at 8?'), 'the phone gets the text');
  await eventually(() => bannerSays(`Sent text to ${PHONE}`), 'and Pigeon says it went');

  clearNotifications();
  const notes = GLib.build_filenamev([scratch('pigeon'), 'notes.pdf']);
  GLib.mkdir_with_parents(scratch('pigeon'), 0o700);
  GLib.file_set_contents(notes, bytes(300_000, 7));
  await call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop', 'com.lantharos.KestrelChecks.FileChooser', 'Answer',
    new GLib.Variant('(s)', [GLib.filename_to_uri(notes, null)]));
  click(button(await openPanel(), PHONE)!);
  click(button(await eventually(() => popupShowing('Text or a link'), 'the phone opens again'), 'Files')!);
  await eventually(() => [...phone.uploads.values()].some(upload => same(upload, read(notes))), 'a chosen file reaches the phone whole');
  await eventually(() => bannerSays(`Sent a file to ${PHONE}`), 'and Pigeon says so');

  clearNotifications();
  phone.mode = 'pin';
  phone.uploads.clear();
  click(button(await openPanel(), PHONE)!);
  click(button(await eventually(() => popupShowing('Text or a link'), 'the phone opens again'), 'Files')!);
  const asking = await eventually(() => popupShowing(`Enter the PIN ${PHONE} shows`), 'a phone that wants a PIN gets one asked for');
  await typeInto(asking, '1111');
  click(button(asking, 'Send')!);
  const again = await eventually(() => popupShowing("That PIN wasn't right. Try again."), 'a wrong PIN asks again');
  await typeInto(again, PHONE_PIN);
  click(button(again, 'Send')!);
  await eventually(() => phone.uploads.size === 1, 'the right one lets the file through');
  require(phone.offers.at(-1)!.pin === PHONE_PIN, 'with the PIN the phone asked for');

  clearNotifications();
  phone.mode = 'decline';
  click(button(await openPanel(), PHONE)!);
  click(button(await eventually(() => popupShowing('Text or a link'), 'the phone opens again'), 'Files')!);
  await eventually(() => bannerSays(`${PHONE} declined`), 'a phone that declines is said to');
  phone.mode = 'accept';
}

/** Files dragged from Rover onto Pigeon in the taskbar go to whichever device people pick. */
async function checkDropping(phone: Phone) {
  const folder = scratch('pigeon', 'Drop');
  GLib.mkdir_with_parents(folder, 0o755);
  const map = bytes(90_000, 11);
  GLib.file_set_contents(GLib.build_filenamev([folder, 'Map.png']), map);
  phone.uploads.clear();
  await withApp('rover', [folder], async app => {
    await settled();
    await drag(app.at(FIRST_ENTRY), centerOf(await eventually(element, 'Pigeon sits in the taskbar')), {steps: 24, interval: 30, hover: 300});
    const panel = await eventually(() => popupShowing('Send one file to'), 'dropping a file on Pigeon asks where it goes');
    await press(panel, PHONE);
    await eventually(() => [...phone.uploads.values()].some(upload => same(upload, map)), 'and sends it there');
  });
}

async function checkReceiving(phone: Phone) {
  const photo = bytes(2_400_000, 3);
  const notes = bytes(48_000, 9);
  const offered = phone.offer([file('photo', 'Lake.jpg', photo.length, 'image/jpeg'), file('notes', 'Trip/notes.txt', notes.length, 'text/plain')]);
  const offer = await eventually(() => popupStarting('Wants to send you 2 files,'), 'an offer opens a window with who sends what');
  require(showsText('Lake.jpg', offer) && showsText('Trip/notes.txt', offer), 'naming the files');
  await settled();
  await capture('pigeon-offer');
  await press(offer, 'Accept');
  const answer = await offered;
  require(answer.status === 200, 'accepting lets the phone send');
  const {sessionId, files} = answer.json<{sessionId: string; files: Record<string, string>}>();
  require((await phone.upload(sessionId, 'photo', files.photo!, photo)).status === 200, 'the photo uploads');
  require((await phone.upload(sessionId, 'notes', files.notes!, notes)).status === 200, 'and the notes');
  const done = await eventually(() => popupShowing('Saved in Inbox'), 'the window says where they went');
  require(same(read(received('Lake.jpg')), photo) && same(read(received('Trip/notes.txt')), notes), 'and they arrived whole, the folder kept');
  require(showsText('Show in folder', done), 'with a way to see them');
  await capture('pigeon-received');

  const declined = phone.offer([file('other', 'other.bin', 10)]);
  await press(await eventually(() => popupStarting('Wants to send you a file,'), 'another offer asks again'), 'Decline');
  require((await declined).status === 403, 'declining refuses it');

  const message = 'The code is 4821';
  const sent = phone.offer([text(message)]);
  require((await sent).status === 204, 'text needs no upload');
  const window = await eventually(() => popupShowing(message), 'text from a device that isn’t trusted waits in a window');
  await press(window, 'Copy');
  await eventually(async () => await clipboardText() === message, 'and its Copy button copies it');

  await setSetting(PIGEON, 'receive', new GLib.Variant('b', false));
  await eventually(async () => (await phone.offer([file('late', 'late.bin', 1)])).status === 403, 'with receiving off, offers are refused');
  await setSetting(PIGEON, 'receive', new GLib.Variant('b', true));
}

async function checkTrusted(phone: Phone) {
  await setSetting(PIGEON, 'copy-picture', new GLib.Variant('b', true));
  const notes = bytes(1200, 5);
  const offered = phone.offer([file('trip', 'plans.txt', notes.length, 'text/plain')]);
  const offer = await eventually(() => popupStarting('Wants to send you a file,'), 'the phone offers a file');
  await press(offer, `Always accept from ${PHONE}`);
  await press(offer, 'Accept');
  const first = (await offered).json<{sessionId: string; files: Record<string, string>}>();
  await phone.upload(first.sessionId, 'trip', first.files.trip!, notes);
  await eventually(() => popupShowing('Saved in Inbox'), 'it arrives, and the phone is trusted from now on');

  clearNotifications();
  await eventually(async () => (await phone.offer([text('https://luft.computer')])).status === 204, 'the trusted phone sends text');
  await eventually(async () => await clipboardText() === 'https://luft.computer', 'which lands straight on the clipboard');
  await eventually(() => bannerSays(`Copied text from ${PHONE}`), 'with a note that says so');

  const picture = GLib.file_get_contents(GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extensions', PIGEON, 'icon.svg']))[1];
  const answer = await phone.offer([file('pic', 'Sunset.png', picture.length, 'image/png')]);
  require(answer.status === 200 && !popups().some(popup => button(popup, 'Accept')), 'files from a trusted phone arrive without asking');
  const {sessionId, files} = answer.json<{sessionId: string; files: Record<string, string>}>();
  await phone.upload(sessionId, 'pic', files.pic!, picture);
  await eventually(() => bannerSays(`A file from ${PHONE}`), 'and say so when they did');
  await eventually(() => exists(received('Sunset.png')) && clipboardTypes().includes('image/png'), 'a single picture is on the clipboard too');
}

export async function run() {
  const present = element();
  if (present instanceof St.Widget) await checkFirstLayout(present);
  GLib.mkdir_with_parents(GLib.path_get_dirname(STORAGE()), 0o700);
  GLib.file_set_contents(STORAGE(), JSON.stringify({folder: INBOX()}));
  await installBuilt(PIGEON);
  const phone = new Phone(PHONE_PORT, certificate(scratch('pigeon')));
  try {
    await eventually(async () => (await listed(PIGEON))?.state === 'running', 'Pigeon runs once installed');
    const [entries] = (await call('com.lantharos.Kestrel', '/com/lantharos/Kestrel/Extensions', 'com.lantharos.Kestrel.Extensions', 'List', null, '(aa{sv})'))
      .recursiveUnpack<[{id: string; listen?: [number, string][]}[]]>();
    require(JSON.stringify(entries.find(extension => extension.id === PIGEON)?.listen) === '[[53317,"tcp"],[53317,"udp"]]',
      'its List entry names the ports it listens on');
    await checkIcon(await eventually(element, 'Pigeon sits in the taskbar'));
    await capture('pigeon-taskbar-dark');
    await withScheme('light', () => capture('pigeon-taskbar-light'));
    await squareCorners(() => capture('pigeon-taskbar-square'));
    await checkRover();
    phone.stayNearby();
    await openPanel(PHONE_FOUND_MS);
    pressKey(Clutter.KEY_Escape);
    clearNotifications();
    await checkSending(phone);
    await checkDropping(phone);
    clearNotifications();
    await checkReceiving(phone);
    await checkTrusted(phone);
    clearNotifications();
    await withApp('settings', [], async app => (await show(app, `extensions/${PIGEON.toLowerCase()}`)).save('pigeon-settings'));
  } finally {
    phone.stop();
    clearNotifications();
    await request('Remove', PIGEON);
  }
}
