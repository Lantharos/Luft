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
const KEY_LEFTSHIFT = 42;
const KEY_LEFTMETA = 125;
const KEY_F23 = 193;
const COPILOT = [KEY_LEFTMETA, KEY_LEFTSHIFT, KEY_F23];
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

function holdCopilot() {
  for (const key of COPILOT) keyboard().notify_key(now(), key, Clutter.KeyState.PRESSED);
}

function releaseCopilot() {
  for (const key of COPILOT.toReversed()) keyboard().notify_key(now(), key, Clutter.KeyState.RELEASED);
}

function tapKey(key) {
  keyboard().notify_key(now(), key, Clutter.KeyState.PRESSED);
  keyboard().notify_key(now(), key, Clutter.KeyState.RELEASED);
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
}

async function checkSetupOffer() {
  const service = await startService(false);
  holdCopilot();
  await pause(600);
  releaseCopilot();
  const offered = () => Main.messageTray.getSources().some(source => source.notifications.some(notification => notification.title === 'Type by speaking'));
  await eventually(offered, 'holding the key without a downloaded model offers to set dictation up');
  await eventually(() => !indicator().visible, 'the indicator goes away when there’s nothing to listen with');
  for (const source of Main.messageTray.getSources())
    for (const notification of [...source.notifications]) notification.destroy();
  await stop(service);
}

async function dictateInto(window, seconds) {
  const typed = entryText(window);
  holdCopilot();
  await eventually(() => shown(indicator()), 'holding the Copilot key shows the listening indicator');
  await eventually(() => preedit(window).length > 0, 'what is heard shows in the text field while still talking', 15000);
  await capture('dictation');
  await pause(seconds * 1000);
  const released = now();
  releaseCopilot();
  await eventually(() => !preedit(window) && entryText(window) !== typed, 'letting go types what was said', 15000);
  console.log(`Kestrel dictation: typed ${((now() - released) / 1000).toFixed(0)} ms after letting go`);
  return entryText(window).slice(typed.length);
}

async function checkDictation(service) {
  const expected = words(new TextDecoder().decode(GLib.file_get_contents(GLib.build_filenamev([RECORDING, 'speech.txt']))[1]));
  const size = Gio.File.new_for_path(GLib.build_filenamev([RECORDING, 'speech.wav'])).query_info('standard::size', Gio.FileQueryInfoFlags.NONE, null).get_size();
  const seconds = (size - WAV_HEADER) / BYTES_PER_SECOND;
  const entry = gjs('clients/window.js', ['--entry']);
  const window = await waitForWindow('Kestrel window check');
  await eventually(() => window.has_focus() && Main.inputMethod.currentFocus, 'the text field takes the keyboard');

  const text = await dictateInto(window, seconds);
  const typed = words(text);
  const heard = expected.filter(word => typed.includes(word)).length / expected.length;
  console.log(`Kestrel dictation: typed “${text}”, ${Math.round(heard * 100)}% of the words said; ${JSON.stringify(memory(service))} MB`);
  require(heard >= HEARD_ENOUGH, 'the text typed is what was said');

  const before = entryText(window);
  holdCopilot();
  await eventually(() => preedit(window).length > 0, 'dictating again shows what is heard');
  tapKey(KEY_ESC);
  await eventually(() => !preedit(window) && !shown(indicator()), 'Escape stops listening and clears what was heard');
  releaseCopilot();
  await pause(1500);
  require(entryText(window) === before, 'nothing is typed after Escape');
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

export const timeout = 240000;

export async function run() {
  const dictation = new Gio.Settings({schema_id: 'com.lantharos.kestrel.dictation'});
  const copilotKey = new Gio.Settings({schema_id: 'com.lantharos.kestrel.copilot-key'});
  const inputSources = new Gio.Settings({schema_id: 'org.gnome.desktop.input-sources'});
  const savedSources = {sources: inputSources.get_value('sources'), mru: inputSources.get_value('mru-sources')};
  inputSources.set_value('mru-sources', US_LAYOUT);
  inputSources.set_value('sources', US_LAYOUT);
  dictation.set_boolean('enabled', true);
  try {
    await checkPress(copilotKey);
    await checkSetupOffer();
    if (!RECORDING) {
      console.log('Kestrel dictation: KESTREL_DICTATION isn’t set, so dictating into apps isn’t checked');
      return;
    }
    const service = await startService(true);
    try {
      await checkDictation(service);
    } finally {
      await stop(service);
    }
  } finally {
    for (const key of ['enabled', 'language', 'engine']) dictation.reset(key);
    copilotKey.reset('press');
    inputSources.set_value('sources', savedSources.sources);
    inputSources.set_value('mru-sources', savedSources.mru);
  }
}
