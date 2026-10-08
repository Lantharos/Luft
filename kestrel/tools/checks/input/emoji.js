import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import St from 'gi://St';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, firstStyled, named, shown, styled} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {erase, press, type} from '../lib/input.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';

const {require, eventually} = checks('emoji');
const KEPT = 'Keep this on the clipboard';
const US_LAYOUT = new GLib.Variant('a(ss)', [['xkb', 'us']]);
const NEAR = 12;

const clipboard = St.Clipboard.get_default();
const panel = () => named('kestrel-emoji');
const cells = () => styled('kestrel-emoji-cell', panel()).filter(actor => actor.visible).sort((a, b) => a.y - b.y || a.x - b.x);
const firstResult = () => cells()[0]?.accessible_name;
const searchText = () => firstStyled('kestrel-emoji-search', panel()).text;
const footer = () => firstStyled('kestrel-emoji-name', panel())?.text;
const currentTab = () => descendants(panel()).find(actor => actor.has_style_class_name?.('kestrel-emoji-category') && actor.has_style_pseudo_class('checked'));
const readClipboard = () => new Promise(resolve => clipboard.get_text(St.ClipboardType.CLIPBOARD, (_clipboard, text) => resolve(text)));
const readPicture = () => new Promise(resolve => clipboard.get_content(St.ClipboardType.CLIPBOARD, 'image/png', (_clipboard, bytes) => resolve(bytes?.toArray())));
const belowCaret = caret => Math.abs(panel().y - (caret.y + caret.height)) <= NEAR && Math.abs(panel().x - caret.x) <= NEAR;

async function open(symbol, label) {
  press(Clutter.KEY_Super_L, symbol);
  await eventually(() => shown(panel()), label);
}

async function search(query, expected, label) {
  type(query);
  await eventually(() => searchText() === query && firstResult() === expected, label);
}

async function pick(window, title, label) {
  press(Clutter.KEY_Return);
  await eventually(() => window.title === `Kestrel entry: ${title}`, label);
}

async function startEntry(env = {}) {
  const process = gjs('clients/window.js', ['--entry'], {env});
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus() && Main.inputMethod.caret, 'the text field takes the keyboard');
  return {process, window};
}

async function checkEmoji(window, settings) {
  const caret = Main.inputMethod.caret;
  await open(Clutter.KEY_period, 'Super+. opens the emoji panel');
  require(!Main.inputMethod.hasPreedit(), 'Super+. opens the emoji panel instead of starting IBus emoji typing');
  require(belowCaret(caret), 'the emoji panel opens just below the text cursor');
  require(!global.stage.get_key_focus() && window.has_focus(), 'the focused app keeps its keyboard focus while the panel is open');
  await capture('emoji-picker');

  await search('party', 'party popper', 'searching for party finds 🎉 first');
  await capture('emoji-picker-search');
  await pick(window, '🎉', 'Enter inserts the emoji into the field');
  require(shown(panel()), 'the panel stays open after picking');

  await search('tada', 'party popper', 'searching for tada finds 🎉 by its keyword');
  await pick(window, '🎉🎉', 'picking again inserts another emoji');
  await eventually(() => settings.get_strv('emoji-recent')[0] === '🎉' && firstResult() === 'party popper', 'recently used emoji lead the panel');

  press(Clutter.KEY_Tab);
  press(Clutter.KEY_Return);
  await eventually(() => shown(firstStyled('kestrel-emoji-tones', panel())), 'the skin tones open from the keyboard');
  await capture('emoji-picker-skin-tone');
  press(Clutter.KEY_Right);
  press(Clutter.KEY_Right);
  press(Clutter.KEY_Return);
  await eventually(() => settings.get_string('emoji-skin-tone') === 'medium-light', 'the chosen skin tone is remembered');
  press(Clutter.KEY_Shift_L, Clutter.KEY_ISO_Left_Tab);
  type('waving hand');
  await eventually(() => searchText() === 'waving hand', 'typing searches again');
  await pick(window, '🎉🎉👋🏼', 'people emoji are inserted with the chosen skin tone');
  press(Clutter.KEY_Right);
  await pick(window, '🎉🎉👋🏼🎉', 'arrow keys move between emoji while typing still searches');
}

async function checkSymbols(window, settings) {
  for (const [query, name] of [['em dash', 'em dash'], ['euro', 'euro sign'], ['alpha', 'greek small letter alpha'], ['e acute', 'latin small letter e with acute']]) {
    await search(query, name, `searching for ${query} finds ${name} first`);
    erase(query);
  }
  type('copyright');
  await eventually(() => searchText() === 'copyright' && cells().slice(0, 2).map(cell => cell.accessible_name).sort().join() === 'copyright,copyright sign',
    'search results mix emoji and symbols');
  erase('copyright');
  await search('degree', 'degree sign', 'searching for degree finds ° first');
  await eventually(() => footer() === 'Degree sign · U+00B0', 'the footer shows the name and code point');
  await capture('emoji-picker-symbol-search');
  await pick(window, '🎉🎉👋🏼🎉°', 'Enter inserts a symbol into the field');

  press(Clutter.KEY_Tab);
  press(Clutter.KEY_Tab);
  for (let step = 0; step < 9; step++) press(Clutter.KEY_Right);
  press(Clutter.KEY_Return);
  await eventually(() => currentTab()?.accessible_name === 'Common symbols', 'the symbol tabs are reachable from the keyboard');
  await capture('emoji-picker-symbols');
  press(Clutter.KEY_Down);
  await eventually(() => footer() === 'Copyright sign · U+00A9', 'moving into the grid selects the first symbol of the tab');
  await pick(window, '🎉🎉👋🏼🎉°©', 'a symbol picked from its tab goes into the field');
  type('x');
  await eventually(() => searchText() === 'x', 'typing searches from the tab');
  erase('x');
  await eventually(() => searchText() === '' && settings.get_strv('emoji-recent').slice(0, 2).join() === '©,°' && firstResult() === 'copyright sign',
    'picked symbols lead the recently used list');

  press(Clutter.KEY_Super_L, Clutter.KEY_period);
  await eventually(() => !panel().visible, 'the shortcut closes the panel again while it is open');
  await open(Clutter.KEY_period, 'the shortcut opens the panel again');
  press(Clutter.KEY_Escape);
  await eventually(() => !panel().visible, 'Escape closes the panel');
  type('ok');
  await eventually(() => window.title === 'Kestrel entry: 🎉🎉👋🏼🎉°©ok', 'typing reaches the app again');
}

async function pasteInto(window, query, title, label, kept) {
  type(query);
  await eventually(() => searchText() === query, `the panel searches for ${query}`);
  press(Clutter.KEY_Return);
  await eventually(async () => !panel().visible && window.title === `Kestrel entry: ${title}` && await kept(), label);
}

async function checkX11() {
  clipboard.set_text(St.ClipboardType.CLIPBOARD, KEPT);
  const {window} = await startEntry({GDK_BACKEND: 'x11', GTK_IM_MODULE: 'ibus'});
  require(window.get_client_type() === Meta.WindowClientType.X11, 'the app runs under Xwayland');
  const caret = Main.inputMethod.caret;
  await open(Clutter.KEY_semicolon, 'Super+; opens the panel for an X11 app');
  require(panel().contains(global.stage.get_key_focus()), 'the panel takes the keyboard for an X11 app, which has no text input support');
  require(belowCaret(caret), 'the panel opens just below the text cursor of an X11 app');
  await pasteInto(window, 'rocket', '🚀', 'an X11 app gets the emoji pasted and the clipboard keeps its content',
    async () => await readClipboard() === KEPT);

  const picture = new Uint8Array(256 * 1024).map((_, index) => index * 31);
  clipboard.set_content(St.ClipboardType.CLIPBOARD, 'image/png', new GLib.Bytes(picture));
  await open(Clutter.KEY_semicolon, 'Super+; opens the panel again');
  await pasteInto(window, 'rocket', '🚀🚀', 'a picture on the clipboard survives pasting an emoji into an X11 app', async () => {
    const kept = await readPicture();
    return kept?.length === picture.length && kept.every((value, index) => value === picture[index]);
  });

  clipboard.set_text(St.ClipboardType.CLIPBOARD, KEPT);
  await open(Clutter.KEY_semicolon, 'Super+; opens the panel once more');
  await pasteInto(window, 'em dash', '🚀🚀—', 'an X11 app gets a symbol pasted and the clipboard keeps its content',
    async () => await readClipboard() === KEPT);
}

export async function run() {
  const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const savedSources = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources')};
  inputSources.set_value('mru-sources', US_LAYOUT);
  inputSources.set_value('sources', US_LAYOUT);
  settings.reset('emoji-recent');
  settings.reset('emoji-skin-tone');
  try {
    const {process, window} = await startEntry();
    await checkEmoji(window, settings);
    await checkSymbols(window, settings);
    await stop(process);
    await checkX11();
  } finally {
    settings.reset('emoji-recent');
    settings.reset('emoji-skin-tone');
    inputSources.set_value('sources', savedSources.sources);
    inputSources.set_value('mru-sources', savedSources.mru);
  }
}
