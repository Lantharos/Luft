import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import {checks} from '../../lib/check.js';
import {press, type} from '../../lib/input.js';
import {within} from '../../lib/wait.js';
import {changes, followLink} from '../lib/apps.js';
import {exists, read} from '../lib/files.js';
import {saveBothStyles} from '../lib/palette.js';
import {code, focus, keymapChanged, openEntry, tryFieldHolds, typeInto, useSources} from './typing.js';

const {require, eventually} = checks('Keys');
const KEY_A = 30;
const KEY_E = 18;
const KEY_X = 45;
const KEY_TAB = 15;
const KEY_BACKSPACE = 14;
const KEY_SPACE = 57;
const KEY_LEFT = 105;
const KEY_APOSTROPHE = 40;
const KEY_LEFTCTRL = 29;
const KEY_1 = 2;
const KEY_2 = 3;
const KEY_3 = 4;
const SAVED = 5000;
export const RULES = GLib.build_filenamev([GLib.get_user_config_dir(), 'xkb/rules/evdev.xml']);

export const userLayouts = () => exists(RULES) ? [...read(RULES).matchAll(/<name>([^<]+)<\/name>/g)].map(match => match[1]) : [];

async function pick(app, search) {
  await changes(app, 'Keys opens the character search', () => press(Clutter.KEY_Return));
  await changes(app, `Keys searches for ${search}`, () => type(search));
  press(Clutter.KEY_Return);
}

async function tab(app, palette, key, name) {
  await changes(app, `Keys switches to ${name}`, () => code(KEY_LEFTCTRL, key));
  await saveBothStyles(app, palette, name);
}

async function create(app, palette) {
  const existing = userLayouts();
  const created = () => userLayouts().find(layout => !existing.includes(layout));
  await changes(app, 'Keys opens a new layout', () => followLink('keys', 'kestrel-keys:layout/new?from=us%2Bintl'));
  press(Clutter.KEY_Return);
  await eventually(created, 'Keys creates the layout', SAVED);
  const id = created();
  const symbols = GLib.build_filenamev([GLib.get_user_config_dir(), 'xkb/symbols', id]);
  require(exists(symbols) && read(symbols).includes('include "us(intl)"'), `a new layout starts from an existing one and is written to ~/.config/xkb as ${id}`);
  await app.settle(() => true);
  await saveBothStyles(app, palette, 'keys-layout');
  return {id, symbols};
}

async function checkEditing(app, palette, symbols) {
  await changes(app, 'pressing a key picks it in Keys', () => code(KEY_A));
  await pick(app, 'small a with ring above');
  await eventually(() => read(symbols).includes('replace key <AC01> { type[Group1] = "FOUR_LEVEL", [ aring,'),
    'pressing a key picks it and a character found by name is assigned to it', SAVED);
  await saveBothStyles(app, palette, 'keys-inspector');
  await tab(app, palette, KEY_2, 'keys-standard-dead-key');
  await tab(app, palette, KEY_3, 'keys-layout-settings');
  await tab(app, palette, KEY_1, 'keys-layout-again');
  await changes(app, 'pressing a key picks it again', () => code(KEY_A));
}

async function checkTyping(app, symbols) {
  const entry = await openEntry();
  try {
    await typeInto(entry, () => code(KEY_A), 'å', 'a GTK app types the character assigned in Keys');
    await typeInto(entry, () => code(KEY_APOSTROPHE, KEY_E), 'åé', 'dead keys from the base layout keep working');

    await focus(app.window);
    const reloaded = keymapChanged();
    await pick(app, 'dotless i');
    await eventually(() => read(symbols).includes('[ idotless,'), 'a second change is saved too', SAVED);
    await within(reloaded, SAVED, 'Kestrel reloads the changed layout');
    await typeInto(entry, () => code(KEY_A), 'åéı', 'changing the layout in Keys switches the running keymap live');

    await focus(app.window);
    await changes(app, 'Escape leaves the character', () => press(Clutter.KEY_Escape));
    await changes(app, 'Tab moves to the Try it field', () => code(KEY_TAB));
    await tryFieldHolds(app, () => [KEY_E, KEY_A, KEY_E, KEY_LEFT, KEY_APOSTROPHE, KEY_E, KEY_BACKSPACE, KEY_APOSTROPHE, KEY_SPACE, KEY_X].forEach(key => code(key)),
      "eı'xe", 'the Try it field types with the edited layout, dead keys and Space included, at the caret');
  } finally {
    await entry.close();
  }

  const x11 = await openEntry(null, {GDK_BACKEND: 'x11'});
  try {
    require(x11.window.get_client_type() === Meta.WindowClientType.X11, 'the second entry runs under Xwayland');
    await typeInto(x11, () => code(KEY_A), 'ı', 'X11 apps under Xwayland get the custom layout too');
  } finally {
    await x11.close();
  }
}

export async function checkLayout(app, palette) {
  const {id, symbols} = await create(app, palette);
  await checkEditing(app, palette, symbols);
  await useSources([['xkb', id]], 'the custom layout is an input source Kestrel can switch to');
  await checkTyping(app, symbols);
  return id;
}
