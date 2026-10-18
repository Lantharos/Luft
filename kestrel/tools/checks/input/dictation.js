import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {firstStyled, named, shown} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {keyboard} from '../lib/input.js';
import {gjs, repository, scratch, spawn, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';

const {require, eventually} = checks('dictation');
const SPEECH = 'com.lantharos.Speech1';
const SERVICE = repository('packages', 'speech', 'service', 'target', 'release', 'luft-speech');
const RECORDING = GLib.getenv('KESTREL_DICTATION');
const KEY_ESC = 1;
const KEY_TAB = 15;
const KEY_LEFTCTRL = 29;
const KEY_D = 32;
const KEY_J = 36;
const KEY_LEFTSHIFT = 42;
const KEY_LEFTALT = 56;
const KEY_RIGHTALT = 100;
const KEY_LEFTMETA = 125;
const KEY_RIGHTMETA = 126;
const KEY_F23 = 193;
const COPILOT = [KEY_LEFTMETA, KEY_LEFTSHIFT, KEY_F23];
const SUPER_ALT = [KEY_LEFTMETA, KEY_LEFTALT];
const ALT_SUPER = [KEY_RIGHTALT, KEY_RIGHTMETA];
const HOLD_MS = 600;
const US_LAYOUT = new GLib.Variant('a(ss)', [['xkb', 'us']]);
const WAV_HEADER = 44;
const BYTES_PER_SECOND = 32000;
const HEARD_ENOUGH = 0.8;

const now = () => GLib.get_monotonic_time();
const indicator = () => firstStyled('kestrel-dictation');
const start = () => named('kestrel-start');
const words = text => text.toLowerCase().split(/[^\p{L}\p{N}']+/u).filter(Boolean);
const entryText = window => window.title.match(/^Kestrel entry: (.*?)(?: \[.*\])?$/)?.[1] ?? '';
const preedit = window => window.title.match(/\[(.+)\]$/)?.[1] ?? '';

function holdKeys(keys) {
  for (const key of keys) keyboard().notify_key(now(), key, Clutter.KeyState.PRESSED);
}

function releaseKeys(keys) {
  for (const key of keys) keyboard().notify_key(now(), key, Clutter.KeyState.RELEASED);
}

const holdCopilot = () => holdKeys(COPILOT);
const releaseCopilot = () => releaseKeys(COPILOT.toReversed());
const tapKey = key => {
  holdKeys([key]);
  releaseKeys([key]);
};
const tapChord = () => {
  holdKeys(SUPER_ALT);
  releaseKeys(SUPER_ALT);
};
const offeredSetup = () => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === 'Type by speaking'));

function dismissNotifications() {
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
}

async function owned(name) {
  const reply = await Gio.DBus.session.call('org.freedesktop.DBus', '/org/freedesktop/DBus', 'org.freedesktop.DBus', 'NameHasOwner',
    new GLib.Variant('(s)', [name]), new GLib.VariantType('(b)'), Gio.DBusCallFlags.NONE, -1, null);
  return reply.deep_unpack()[0];
}

function memory(process) {
  const status = new TextDecoder().decode(GLib.file_get_contents(`/proc/${process.get_identifier()}/status`)[1]);
  return Object.fromEntries(['VmHWM', 'VmRSS', 'RssAnon'].map(field => [field, status.match(new RegExp(`^${field}:\\s+(\\d+) kB`, 'm'))?.[1] / 1024]));
}

async function startService(withModels) {
  const data = scratch('kestrel-dictation', withModels ? 'downloaded' : 'nothing-downloaded');
  const store = GLib.build_filenamev([data, 'luft-speech']);
  GLib.mkdir_with_parents(store, 0o700);
  const models = Gio.File.new_for_path(GLib.build_filenamev([store, 'models']));
  if (withModels && !models.query_exists(null)) models.make_symbolic_link(GLib.build_filenamev([RECORDING, 'models']), null);
  const env = {XDG_DATA_HOME: data, LUFT_SPEECH_WAV: RECORDING ? GLib.build_filenamev([RECORDING, 'speech.wav']) : null};
  const process = spawn([SERVICE], {env});
  await eventually(() => owned(SPEECH), 'the dictation service is on the session bus', 15000);
  return process;
}

async function checkPress(copilotKey) {
  copilotKey.set_string('press', 'search');
  holdCopilot();
  releaseCopilot();
  await eventually(() => shown(start()), 'a press of the Copilot key opens Start');
  require(!indicator().visible, 'a press doesn’t start dictating');
  holdCopilot();
  releaseCopilot();
  await eventually(() => !start().visible, 'another press closes Start again');

  copilotKey.set_boolean('hold', false);
  holdCopilot();
  await eventually(() => shown(start()), 'with holding turned off, the Copilot key opens Start as soon as it goes down');
  await pause(HOLD_MS);
  require(!indicator().visible, 'holding the Copilot key doesn’t dictate when its hold is turned off');
  releaseCopilot();
  holdCopilot();
  releaseCopilot();
  await eventually(() => !start().visible, 'pressing it again closes Start');
  copilotKey.reset('hold');
}

async function checkSetupOffer() {
  const service = await startService(false);
  holdCopilot();
  await pause(HOLD_MS);
  releaseCopilot();
  await eventually(offeredSetup, 'holding the key without a downloaded model offers to set dictation up');
  await eventually(() => !indicator().visible, 'the indicator goes away when there’s nothing to listen with');
  dismissNotifications();

  holdKeys(SUPER_ALT);
  await pause(HOLD_MS);
  releaseKeys(SUPER_ALT);
  await eventually(offeredSetup, 'holding Super and Alt dictates too, offering to set it up first');
  dismissNotifications();
  tapChord();
  await eventually(offeredSetup, 'a quick press of Super and Alt starts listening too');
  dismissNotifications();
  await stop(service);
}

async function checkChordKeepsShortcuts() {
  holdKeys(SUPER_ALT);
  releaseKeys(SUPER_ALT);
  await pause(400);
  require(!shown(start()), 'letting go of Super and Alt doesn’t open Start');
  holdKeys(ALT_SUPER);
  tapKey(KEY_J);
  await pause(HOLD_MS);
  releaseKeys(ALT_SUPER);
  await pause(400);
  require(!indicator().visible && !offeredSetup() && !shown(start()), 'Super and Alt with another key, held in either order, leave dictation alone');
  holdKeys([KEY_LEFTALT, KEY_TAB]);
  releaseKeys([KEY_TAB]);
  holdKeys([KEY_LEFTMETA]);
  await pause(HOLD_MS);
  releaseKeys([KEY_LEFTMETA, KEY_LEFTALT]);
  await pause(400);
  require(!indicator().visible && !offeredSetup(), 'Alt+Tab followed by Super doesn’t dictate');
  tapKey(KEY_LEFTMETA);
  await eventually(() => shown(start()), 'a press of Super alone still opens Start');
  tapKey(KEY_LEFTMETA);
  await eventually(() => !start().visible, 'and closes it again');
}

async function dictateInto(window, seconds, {down, up, name}) {
  const typed = entryText(window);
  down();
  await eventually(() => shown(indicator()), `holding ${name} shows the listening indicator`);
  await eventually(() => preedit(window).length > 0, 'what is heard shows in the text field while still talking', 15000);
  await capture('dictation');
  await pause(seconds * 1000);
  const released = now();
  up();
  await eventually(() => !preedit(window) && entryText(window) !== typed, 'letting go types what was said', 15000);
  console.log(`Kestrel dictation: typed ${((now() - released) / 1000).toFixed(0)} ms after letting go`);
  return entryText(window).slice(typed.length);
}

function heardEnough(text, expected) {
  const typed = words(text);
  return expected.filter(word => typed.includes(word)).length / expected.length >= HEARD_ENOUGH;
}

async function checkShortcut(window, seconds, expected, keybindings) {
  const holding = await dictateInto(window, seconds, {down: () => holdKeys(ALT_SUPER), up: () => releaseKeys(ALT_SUPER), name: 'Alt and Super'});
  require(heardEnough(holding, expected), 'holding Alt and Super types what was said');

  let before = entryText(window);
  tapChord();
  await eventually(() => shown(indicator()), 'a quick press of Super and Alt starts listening');
  await eventually(() => preedit(window).length > 0, 'what is heard shows while listening', 15000);
  await pause(seconds * 1000);
  tapChord();
  await eventually(() => !preedit(window) && entryText(window) !== before, 'pressing Super and Alt again types what was said', 15000);
  require(heardEnough(entryText(window).slice(before.length), expected), 'the text typed after pressing twice is what was said');

  before = entryText(window);
  tapChord();
  await eventually(() => preedit(window).length > 0, 'pressing Super and Alt listens again', 15000);
  await eventually(() => !shown(indicator()) && !preedit(window) && entryText(window) !== before, 'it stops by itself once nothing has been said for a few seconds', (seconds + 10) * 1000);
  require(heardEnough(entryText(window).slice(before.length), expected), 'what was said before the quiet is typed');

  before = entryText(window);
  tapChord();
  await eventually(() => preedit(window).length > 0, 'pressing Super and Alt listens once more', 15000);
  tapKey(KEY_ESC);
  await eventually(() => !preedit(window) && !shown(indicator()), 'Escape stops listening that was started with a press');
  await pause(1500);
  require(entryText(window) === before, 'nothing is typed after Escape');

  keybindings.set_strv('dictate', ['<Control><Super>d']);
  const custom = await dictateInto(window, seconds, {
    down: () => holdKeys([KEY_LEFTCTRL, KEY_LEFTMETA, KEY_D]),
    up: () => releaseKeys([KEY_LEFTMETA, KEY_LEFTCTRL, KEY_D]),
    name: 'a shortcut of its own',
  });
  require(heardEnough(custom, expected), 'a changed shortcut types what was said, even when its modifiers come up before its key');
  keybindings.reset('dictate');
}

async function checkDictation(service, keybindings) {
  const expected = words(new TextDecoder().decode(GLib.file_get_contents(GLib.build_filenamev([RECORDING, 'speech.txt']))[1]));
  const size = Gio.File.new_for_path(GLib.build_filenamev([RECORDING, 'speech.wav'])).query_info('standard::size', Gio.FileQueryInfoFlags.NONE, null).get_size();
  const seconds = (size - WAV_HEADER) / BYTES_PER_SECOND;
  const entry = gjs('clients/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus() && Main.inputMethod.currentFocus, 'the text field takes the keyboard');

  const text = await dictateInto(window, seconds, {down: holdCopilot, up: releaseCopilot, name: 'the Copilot key'});
  console.log(`Kestrel dictation: typed “${text}”; ${JSON.stringify(memory(service))} MB`);
  require(heardEnough(text, expected), 'the text typed is what was said');

  const before = entryText(window);
  holdCopilot();
  await eventually(() => preedit(window).length > 0, 'dictating again shows what is heard');
  tapKey(KEY_ESC);
  await eventually(() => !preedit(window) && !shown(indicator()), 'Escape stops listening and clears what was heard');
  releaseCopilot();
  await pause(1500);
  require(entryText(window) === before, 'nothing is typed after Escape');
  await checkShortcut(window, seconds, expected, keybindings);
  await stop(entry);

  const x11 = gjs('clients/window.js', ['--entry'], {env: {GDK_BACKEND: 'x11', GTK_IM_MODULE: 'ibus'}});
  const x11Window = await waitForWindow('Kestrel window check');
  require(x11Window.get_client_type() === Meta.WindowClientType.X11, 'the second text field runs under Xwayland');
  await eventually(() => x11Window.has_focus(), 'the X11 text field takes the keyboard');
  holdCopilot();
  await eventually(() => firstStyled('kestrel-dictation-text')?.text, 'an app without text input support shows what is heard in the indicator', 15000);
  await pause(seconds * 1000);
  releaseCopilot();
  await eventually(() => words(entryText(x11Window)).filter(word => expected.includes(word)).length >= expected.length * HEARD_ENOUGH,
    'an app without text input support gets what was said pasted', 15000);
  await stop(x11);
}

export const timeout = 360000;

export async function run() {
  const dictation = new Gio.Settings({schema_id: 'com.lantharos.kestrel.dictation'});
  const copilotKey = new Gio.Settings({schema_id: 'com.lantharos.kestrel.copilot-key'});
  const keybindings = new Gio.Settings({schema_id: 'com.lantharos.kestrel.keybindings'});
  const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const savedSources = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources')};
  inputSources.set_value('mru-sources', US_LAYOUT);
  inputSources.set_value('sources', US_LAYOUT);
  dictation.set_boolean('enabled', true);
  try {
    await checkPress(copilotKey);
    await checkSetupOffer();
    await checkChordKeepsShortcuts();
    if (!RECORDING) {
      console.log('Kestrel dictation: KESTREL_DICTATION isn’t set, so dictating into apps isn’t checked');
      return;
    }
    const service = await startService(true);
    try {
      await checkDictation(service, keybindings);
    } finally {
      await stop(service);
    }
  } finally {
    for (const key of ['enabled', 'language', 'engine']) dictation.reset(key);
    copilotKey.reset('press');
    copilotKey.reset('hold');
    keybindings.reset('dictate');
    inputSources.set_value('sources', savedSources.sources);
    inputSources.set_value('mru-sources', savedSources.mru);
  }
}
