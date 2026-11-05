import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {openEntry} from '../apps/keys/typing.js';
import {descendants, named, showsText} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click, press} from '../lib/input/input.js';
import {spawn, stop} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {install, listed, request} from './lib/extensions.js';
import {intoSpeakers, speakersIntoLevels} from '../lib/audio/routing.js';

const {require, eventually} = checks('extension API');
const API = 'com.example.Api';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});

interface ApiState {
  shortcuts: number;
  typed: boolean | null;
  closed: number;
  sliders: number[];
  ended: number;
  actions: string[];
  layerFrames: number;
  popup: {open: boolean};
  window: {open: boolean};
  listener: {read(): {level: number; bands: number[]}; dispose(): void};
  update(): void;
  openWindow(): void;
  typeNow(text: string): boolean;
  label(): string | null;
  play(): void;
  loop(): {stop(fade?: number): void};
  listen(bands: number): void;
  playing(): boolean;
  store(value: unknown): void;
  appearance: {colors: Record<string, string>; font: string; textScale: number; squareCorners: boolean; onChanged(changed: () => void): {dispose(): void}};
}

const api = () => (globalThis as {api?: ApiState}).api!;
const popups = () => descendants(global.stage).filter(actor => actor.name === 'kestrel-extension-popup' && actor.mapped);
const taskbarItem = () => descendants(named('kestrel-extension-items')!).find(actor => actor.accessible_name === 'Api' && actor.mapped) ?? null;
const storageFile = () => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${API}.json`]);
const shortcut = async (key: string) => (await listed(API) as unknown as {shortcuts: {key: string; accelerators: string[]}[]}).shortcuts.find(entry => entry.key === key)!;

async function page(): Promise<{title?: string; items: Record<string, unknown>[]}[]> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [API]), '(s)')).deepUnpack<[string]>();
  return JSON.parse(json);
}

async function checkListing() {
  const extension = await eventually(async () => (await listed(API))?.state === 'running' && await listed(API), 'an extension with every new permission runs');
  const listing = extension as unknown as {page: boolean; settings: {key: string; page?: string; images?: string[]}[]};
  require((await shortcut('type')).accelerators.join() === '<Super><Alt>y', 'its free default shortcut is bound');
  require((await shortcut('taken')).accelerators.length === 0, 'a default that quick settings already uses is left unset');
  require(listing.page, 'it describes a settings page of its own');
  require(listing.settings.find(setting => setting.key === 'glow')?.page === 'appearance', 'a setting can show on the Appearance page too');
  require(listing.settings.find(setting => setting.key === 'look')?.images?.length === 2, 'a choice offers its pictures to Settings');
}

async function checkAppearance() {
  const {appearance} = api();
  require(/^#[0-9a-f]{6}$/.test(appearance.colors.surface), 'it reads the current style’s colors by role');
  require(appearance.font.length > 0 && appearance.textScale > 0, 'it reads the interface font and text size');
  const rounded = kestrel.get_boolean('rounded-window-corners');
  let told = false;
  const watching = appearance.onChanged(() => (told = true));
  kestrel.set_boolean('rounded-window-corners', !rounded);
  await eventually(() => told, 'it hears when the corners change');
  require(appearance.squareCorners === rounded, 'and reads the new corners');
  watching.dispose();
  kestrel.reset('rounded-window-corners');
}

async function checkPanel() {
  require(!api().typeNow('too early'), 'it can’t type before anyone used it');
  click(taskbarItem()!);
  const [panel] = await eventually(() => popups().length === 1 && popups(), 'clicking its taskbar item opens its panel');
  await eventually(() => panel.opacity === 255, 'the panel fades in');
  require(showsText('Pressed 0 times', panel), 'the panel shows the extension’s view');
  require(panel.contains(global.stage.get_key_focus()!), 'the panel takes the keyboard');
  await capture('extension-panel');
  const slider = descendants(panel).find(actor => actor instanceof St.Widget && actor.has_style_class_name('slider'))!;
  api().update();
  await eventually(() => showsText('Pressed 1 times', panel), 'an update shows new content');
  require(descendants(panel).includes(slider) && Math.abs((slider as unknown as {value: number}).value - 0.75) < 0.01, 'and keeps the slider, moved to its new value');
  require(api().sliders.length === 0, 'without telling the extension about a change it made itself');
  const go = descendants(panel).find(actor => actor instanceof St.Button && actor.accessible_name === 'Go')!;
  (go as St.Button).emit('clicked', 1);
  require(api().actions.includes('go'), 'its buttons run the extension’s callbacks');
  press(Clutter.KEY_Escape);
  await eventually(() => !popups().length && api().closed === 1 && !api().popup.open, 'Escape closes the panel and tells the extension');
}

async function checkWindow() {
  api().openWindow();
  const [window] = await eventually(() => popups().length === 1 && popups(), 'it opens a small window');
  await eventually(() => window.opacity === 255, 'the window fades in');
  const focus = global.stage.get_key_focus();
  require(!focus || !window.contains(focus), 'a window leaves the keyboard where it was');
  await capture('extension-window');
  click(descendants(window).find(actor => actor instanceof St.Button && actor.accessible_name === 'Close')!);
  await eventually(() => !popups().length && !api().window.open, 'its close button closes it');
}

async function checkShortcutsAndTyping() {
  const entry = await openEntry();
  try {
    press(Clutter.KEY_Super_L, Clutter.KEY_Alt_L, Clutter.KEY_y);
    await eventually(() => api().shortcuts === 1 && api().typed, 'pressing its shortcut runs it, and then it may type');
    await eventually(() => entry.window.get_title() === 'Kestrel entry: hi from api', 'what it types lands in the focused field');
    await eventually(() => named('kestrel-privacy')?.visible, 'the taskbar shows that an extension typed');
    await capture('extension-typed');
    await call(NAME, PATH, IFACE, 'SetShortcut', new GLib.Variant('(ssas)', [API, 'type', ['<Super><Alt>u']]));
    await eventually(async () => (await shortcut('type')).accelerators.join() === '<Super><Alt>u', 'a shortcut set in Settings is bound instead');
    require(api().label() === 'Super+Alt+U', 'and the extension can show it');
    press(Clutter.KEY_Super_L, Clutter.KEY_Alt_L, Clutter.KEY_y);
    press(Clutter.KEY_Super_L, Clutter.KEY_Alt_L, Clutter.KEY_u);
    await eventually(() => api().shortcuts === 2, 'the new shortcut runs it and the old one no longer does');
  } finally {
    await entry.close();
  }
}

const API_SOUNDS = {'media.name': 'Api'};

async function checkSounds() {
  const mixer = Shell.Mixer.get_default();
  const loop = api().loop();
  await eventually(() => intoSpeakers(API_SOUNDS, 'Api:output', 2), 'its sounds play through a stream named after it');
  await eventually(() => mixer.playing, 'a looping sound keeps playing');
  api().play();
  await eventually(() => api().ended === 1, 'a sound played alongside ends and says so');
  loop.stop(100);
  await eventually(() => !mixer.playing, 'the loop stops when asked, and the stream goes quiet', 8000);
}

function writeTone(path: string, hertz: number, seconds: number) {
  const rate = 48000;
  const frames = rate * seconds;
  const bytes = new Uint8Array(44 + frames * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + frames * 2, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, frames * 2, true);
  for (let frame = 0; frame < frames; frame++) view.setInt16(44 + frame * 2, Math.round(16000 * Math.sin(2 * Math.PI * hertz * frame / rate)), true);
  GLib.file_set_contents(path, bytes);
}

async function checkLevels() {
  const monitor = Shell.AudioMonitor.get_default();
  api().listen(16);
  await pause(300);
  require(!monitor.get_listening(), 'an open listener costs nothing while nothing plays');
  require(api().listener.read().bands.every(band => band === 0), 'and reads silence');
  const tone = GLib.build_filenamev([GLib.get_user_cache_dir(), 'tone.wav']);
  writeTone(tone, 1000, 8);
  const player = spawn(['pw-play', '-P', '{ node.name = check-tone }', tone]);
  try {
    await eventually(() => intoSpeakers({'node.name': 'check-tone'}, 'check-tone:output', 1), 'the tone reaches the speakers');
    await eventually(() => monitor.get_listening(), 'it starts listening once something plays');
    await eventually(() => speakersIntoLevels(), 'and hears the speakers');
    const reading = await eventually(() => {
      const read = api().listener.read();
      return read.level > 0.2 && read;
    }, 'it hears how loud the tone is');
    const loudest = reading.bands.indexOf(Math.max(...reading.bands));
    const expected = Math.floor(16 * Math.log(1000 / 40) / Math.log(16000 / 40));
    require(Math.abs(loudest - expected) <= 1, `the 1 kHz tone is loudest in its band (band ${loudest} of 16, expected ${expected})`);
  } finally {
    await stop(player);
    api().listener.dispose();
  }
  await eventually(() => !monitor.get_listening(), 'it stops listening when the tone ends');
}

async function checkLayer() {
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    const sheet = await eventually(() => descendants(global.window_group).find(actor => actor.name === `extension-layer:${API}`), 'a layer can sit below the windows');
    const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
    require(sheet.height === 120 && sheet.y === monitor.y + monitor.height - 120, 'and covers only the area it asked for');
    const frames = api().layerFrames;
    await pause(200);
    require(api().layerFrames > frames, 'it draws frames while it shows');
  } finally {
    global.force_animations = forced;
  }
}

async function checkStorageAndPage() {
  api().store('kept');
  const before = await page();
  require(JSON.stringify(before).includes('"value":"kept"'), 'its settings page shows values only it knows');
  require(before[0].items[0].type === 'setting' && before[0].items[1].type === 'preview', 'and declared settings and previews among them');
  const remembered = before[1].items.find(item => item.type === 'switch')!;
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [API, remembered.action as string, new GLib.Variant('b', false)]));
  require(JSON.stringify(await page()).includes('"value":"false"'), 'Settings can change them through the page’s controls');
  await request('Disable', API);
  const [, contents] = GLib.file_get_contents(storageFile());
  require(JSON.parse(new TextDecoder().decode(contents)).kept === false, 'what it stores is written when it’s turned off');
  await request('Enable', API);
}

export async function run() {
  install('api', API);
  await request('Reload', API);
  try {
    await checkListing();
    await checkAppearance();
    await checkPanel();
    await checkWindow();
    await checkShortcutsAndTyping();
    await checkLayer();
    await checkSounds();
    await checkLevels();
    await checkStorageAndPage();
  } finally {
    await request('Remove', API);
    for (const key of ['disabled-extensions', 'extension-settings', 'extension-problems', 'extension-shortcuts']) kestrel.reset(key);
  }
  require(!GLib.file_test(storageFile(), GLib.FileTest.EXISTS), 'removing it deletes what it stored');
}
