import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Main} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, shown, showsText, styled} from '../../lib/actors.js';
import {checks} from '../../lib/check.js';
import {call} from '../../lib/dbus.js';
import {click, type as typeText} from '../../lib/input/input.js';
import {scratch} from '../../lib/processes.js';
import {capture} from '../../lib/screenshots.js';
import {pause, settled} from '../../lib/wait.js';
import type {Nearby} from './nearby.js';

const {require, eventually} = checks('Post');
const POST = 'com.lantharos.Kestrel.Post';
const PATH = '/com/lantharos/Kestrel/Post';
export const NEARBY = 'Noor’s laptop';
const FOUND_WITHIN = 30000;
const SCANNED_WITHIN = 10000;

export const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.post'});
export const popups = () => descendants(global.stage).filter(actor => actor.name === 'kestrel-extension-popup' && actor.mapped && actor.reactive);
export const popupShowing = (text: string) => popups().find(popup => showsText(text, popup)) ?? null;
const startsWith = (prefix: string) => (actor: Clutter.Actor) => actor instanceof St.Label && actor.mapped && actor.text.startsWith(prefix);
export const popupStarting = (prefix: string) => popups().find(popup => descendants(popup).some(startsWith(prefix))) ?? null;
const named = (actor: Clutter.Actor, name: string) => actor.accessible_name === name || actor.accessible_name?.startsWith(`${name}, `);
export const button = (root: Clutter.Actor, name: string) =>
  descendants(root).find(actor => actor instanceof St.Button && named(actor, name) && actor.mapped) as St.Button | undefined;
const entry = (root: Clutter.Actor) => descendants(root).find(actor => actor instanceof St.Entry && actor.mapped) as St.Entry;
export const bannerSays = (text: string) => styled('notification-banner', Main.uiGroup).filter(shown).some(banner => showsText(text, banner));
const read = (path: string) => GLib.file_get_contents(path)[1];
export const same = (a: Uint8Array, b: Uint8Array) => a.length === b.length && a.every((byte, index) => byte === b[index]);
export const yours = () => (settings.get_value('devices').deepUnpack() as [string, string][]).map(([id]) => id);
export const inbox = () => scratch('post', 'Inbox');

export function bytes(length: number, seed: number): Uint8Array {
  return Uint8Array.from({length}, (_, index) => (index * 31 + seed) % 251);
}

export async function closeWindows() {
  for (const popup of popups()) await press(popup, 'Close');
  await eventually(() => !popups().length, 'Post’s windows close');
}

export function clearNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

function clipboardText(): Promise<string | null> {
  return new Promise(resolve => St.Clipboard.get_default().get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));
}

export async function press(popup: Clutter.Actor, name: string) {
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

export function postCall<S extends string>(method: string, parameters: GLib.Variant | null = null, reply: S | null = null) {
  return call(POST, PATH, POST, method, parameters, reply);
}

export async function nearbyId(): Promise<string> {
  const found = async () => {
    const reply = await call(POST, PATH, 'org.freedesktop.DBus.Properties', 'Get', new GLib.Variant('(ss)', [POST, 'Devices']), '(v)');
    return reply.recursiveUnpack<[[string, string][]]>()[0].find(([, alias]) => alias === NEARBY)?.[0] ?? null;
  };
  return eventually(async () => {
    const id = await found();
    if (!id) await postCall('Scan');
    return id;
  }, 'this computer finds the nearby one', FOUND_WITHIN);
}

export async function thisId(nearby: Nearby): Promise<string> {
  return eventually(async () => {
    const id = (await nearby.devices()).find(([, alias]) => alias === 'Mara’s Laptop')?.[0];
    if (!id) await nearby.scan();
    return id;
  }, 'the nearby computer finds this one', FOUND_WITHIN);
}

export async function checkPairing(nearby: Nearby) {
  await nearby.scan();
  await pause(SCANNED_WITHIN);
  require(!(await nearby.devices()).some(([, alias]) => alias === 'Mara’s Laptop'), 'a computer that isn’t one of yours can’t find this one');
  const [pin] = (await postCall('StartPairing', null, '(s)')).deepUnpack<[string]>();
  const id = await thisId(nearby);
  const notes = GLib.build_filenamev([scratch('post'), 'Plans.txt']);
  GLib.mkdir_with_parents(scratch('post'), 0o700);
  GLib.file_set_contents(notes, 'Dinner at 8\n');
  const sent = await nearby.send(id, [notes]);
  await eventually(() => nearby.stages[sent] === 'pin', 'adding a device asks it for the PIN');
  await nearby.answerPin(sent, pin);
  await eventually(() => yours().length === 1, 'the right PIN makes it one of your devices');
  await eventually(() => nearby.ended(sent)?.outcome === 'done', 'and what it sent arrives without asking');
  require(same(read(GLib.build_filenamev([inbox(), 'Plans.txt'])), read(notes)), 'whole, in the folder people chose');
  await postCall('StopPairing');
}

export async function checkText(nearby: Nearby, id: string) {
  clearNotifications();
  await nearby.sendText(id, 'https://luft.computer');
  await eventually(async () => await clipboardText() === 'https://luft.computer', 'text from one of your devices lands on the clipboard');
  await eventually(() => bannerSays(`Copied text from ${NEARBY}`), 'with a note that says so');
}

export async function checkOffers(nearby: Nearby, id: string) {
  const photo = GLib.build_filenamev([scratch('post'), 'Lake.jpg']);
  GLib.file_set_contents(photo, bytes(2_400_000, 3));
  const map = GLib.build_filenamev([scratch('post'), 'Map.png']);
  GLib.file_set_contents(map, bytes(90_000, 11));
  const sent = await nearby.send(id, [photo, map]);
  const offer = await eventually(() => popupStarting('Wants to send you 2 files,'), 'an offer opens a window with who sends what');
  require(showsText('Lake.jpg', offer) && showsText('Map.png', offer), 'naming the files');
  await settled();
  await capture('post-offer');
  await press(offer, 'Accept');
  const done = await eventually(() => popupShowing('Saved in Inbox'), 'the window says where they went');
  require(showsText('Show in folder', done), 'with a way to see them');
  require(same(read(GLib.build_filenamev([inbox(), 'Lake.jpg'])), read(photo)), 'and they arrived whole');
  await eventually(() => nearby.ended(sent)?.outcome === 'done', 'the nearby computer hears they went');
  await capture('post-received');

  const declined = await nearby.send(id, [map]);
  await press(await eventually(() => popupStarting('Wants to send you a file,'), 'another offer asks again'), 'Decline');
  await eventually(() => nearby.ended(declined)?.outcome === 'declined', 'declining refuses it');

  const again = await nearby.send(id, [map]);
  const asking = await eventually(() => popupStarting('Wants to send you a file,'), 'it offers again');
  await press(asking, `Always accept from ${NEARBY}`);
  await press(asking, 'Accept');
  await eventually(() => nearby.ended(again)?.outcome === 'done', 'accepting takes it');
  await eventually(() => yours().length === 1, 'and Always accept makes it one of your devices');
}

export async function checkPin(nearby: Nearby, device: string) {
  const pin = await nearby.startPairing();
  const notes = GLib.build_filenamev([scratch('post'), 'Notes.txt']);
  GLib.file_set_contents(notes, 'Milk, bread\n');
  await postCall('Send', new GLib.Variant('(sas)', [device, [notes]]), '(s)');
  const asking = await eventually(() => popupShowing(`Enter the PIN ${NEARBY} shows`), 'a computer that wants a PIN gets one asked for');
  await settled();
  await capture('post-pin');
  await typeInto(asking, '111111');
  click(button(asking, 'Send')!);
  const again = await eventually(() => popupShowing('That PIN wasn’t right. Try again.'), 'a wrong PIN asks again');
  await typeInto(again, pin);
  click(button(again, 'Send')!);
  await eventually(() => nearby.finished.some(finished => finished.direction === 'in' && finished.outcome === 'done'
    && finished.saved.some(path => path.endsWith('/Notes.txt'))), 'the right one lets the file through');
  await eventually(() => bannerSays(`Sent a file to ${NEARBY}`), 'and Post says it went');
}
