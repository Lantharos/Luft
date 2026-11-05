import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {launchAgain, type LuftApp} from '../lib/apps/luftApp.js';
import {recorded, toneStrength} from '../lib/audio/ear.js';
import {RATE, wav} from '../lib/audio/music.js';
import {givePorts, intoSpeakers, link} from '../lib/audio/routing.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {hold, press, release} from '../lib/input/input.js';
import {outcome, repository, scratch, spawn, stop, waitForWindow, type Process} from '../lib/processes.js';
import {capture, type Area, type Frame} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {lock, unlock} from '../lockScreen/lib/shield.js';
import {openApp} from './lib/apps.js';
import {exists, read, removeTree, write} from './lib/files.js';

export const timeout = 300000;

const {require, eventually} = checks('Soundboard');
const APP_ID = 'com.lantharos.soundboard';
const SOURCE = {'node.name': 'soundboard'};
const CAPTURE = {'node.name': 'soundboard-capture'};
const MONITOR = {'node.name': 'soundboard-monitor'};
const VOICE_NODE = 'check-voice';
const SOUND_PITCH = 1000;
const VOICE_PITCH = 2600;
const SOUND_SECONDS = 1;
const VOICE_SECONDS = 60;
const LEVEL = 0.4;
const HEARD = 0.1;
const SILENT = 0.01;
const ADD_SOUNDS: [number, number] = [904, 30];
const FIRST_TILE: [number, number] = [370, 130];
const EDIT_ITEM: [number, number] = [392, 146];
const TILE_BESIDE_MENU: [number, number] = [335, 170];
const FIRST_BOARD: [number, number] = [140, 80];
const RENAME_ITEM: [number, number] = [162, 96];
const EMPTY_SPOT: [number, number] = [700, 600];
const MICROPHONE_SELECT: [number, number] = [140, 479];
const BESIDE_TILE = {x: 490, y: 134, width: 60, height: 60};
const BESIDE_BOARD = {x: 284, y: 96, width: 16, height: 80};
const BELOW_SELECT = {x: 40, y: 515, width: 200, height: 100};
const MENU_TOLERANCE = 6;
const MENU_PIXELS = 100;
const LISTEN_MS = 700;
const AFTER_PRESS_MS = 400;
const IDLE_MS = 10000;
const SETTLE_MS = 3000;
const AUDIO_THREAD = /^(data-loop|pw-|soundboard-audi)/;
const MOST_IDLE_WAKEUPS_PER_SECOND = 2;
const HOTKEY = [Clutter.KEY_Control_L, Clutter.KEY_Alt_L, Clutter.KEY_1];
const ACCELERATOR = '<Control><Alt>1';

const MIX_SETTINGS = {mix: {microphone: VOICE_NODE, microphoneLevel: 1, microphoneMuted: false, monitorLevel: 0.7, monitorOn: true}, keepRunning: false};
const settings = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const configFolder = () => repository('kestrel', 'run', 'soundboard-config');
const dataFolder = () => GLib.build_filenamev([GLib.get_user_data_dir(), APP_ID]);
const environment = () => ({XDG_CONFIG_HOME: configFolder()});

function tone(pitch: number, seconds: number) {
  return wav(Float32Array.from({length: RATE * seconds}, (_, index) => Math.sin(2 * Math.PI * pitch * index / RATE) * LEVEL));
}

const settingsFile = () => GLib.build_filenamev([configFolder(), APP_ID, 'settings.json']);

function writeSettings(values: object) {
  write(settingsFile(), JSON.stringify(values));
}

async function nodes() {
  const {stdout} = await outcome(['pw-dump']);
  return (JSON.parse(stdout || '[]') as {type: string; info?: {props?: Record<string, unknown>}}[])
    .filter(object => object.type === 'PipeWire:Interface:Node').map(node => node.info?.props ?? {});
}

const hasNode = async (name: string) => (await nodes()).some(props => props['node.name'] === name);

async function sourceIsReady() {
  const sources = (await nodes()).filter(props => props['node.name'] === SOURCE['node.name']);
  return sources.length === 1 && sources[0]['media.class'] === 'Audio/Source' && sources[0]['node.description'] === 'Soundboard';
}

const fromVirtualMicrophone = async (ear: string) => await givePorts(SOURCE, 'Output', 2) &&
  await link('soundboard:capture_FL', `${ear}:input_FL`) && await link('soundboard:capture_FR', `${ear}:input_FR`);

const listening = (act: () => void | Promise<void>) => recorded(eventually, fromVirtualMicrophone, 'a recorder listens to the virtual microphone', act, LISTEN_MS);

async function addSound(app: LuftApp, path: string) {
  await call('org.freedesktop.impl.portal.desktop.rover', '/org/freedesktop/portal/desktop', 'com.lantharos.KestrelChecks.FileChooser', 'Answer', new GLib.Variant('(s)', [Gio.File.new_for_path(path).get_uri()]));
  app.click(ADD_SOUNDS);
  await eventually(() => exists(GLib.build_filenamev([dataFolder(), 'library.json'])) && soundId() !== null, 'a chosen file joins the board', 15000);
}

function soundId(): number | null {
  const library = JSON.parse(read(GLib.build_filenamev([dataFolder(), 'library.json']))) as {boards: {sounds: {id: number; file: string}[]}[]};
  return library.boards[0]?.sounds[0]?.id ?? null;
}

function checkCopied(original: string) {
  GLib.unlink(original);
  const library = JSON.parse(read(GLib.build_filenamev([dataFolder(), 'library.json']))) as {boards: {sounds: {file: string}[]}[]};
  require(exists(GLib.build_filenamev([dataFolder(), 'sounds', library.boards[0].sounds[0].file])), 'the sound keeps a copy of its own');
}

const shows = async (app: LuftApp, area: Area, base: Frame) => (await app.frame(area)).pixelsApart(base, MENU_TOLERANCE) > MENU_PIXELS;

async function opens(app: LuftApp, area: Area, base: Frame, label: string, act: () => void) {
  act();
  await eventually(() => shows(app, area, base), label);
}

async function closes(app: LuftApp, area: Area, base: Frame, label: string, act: () => void) {
  act();
  await eventually(async () => !await shows(app, area, base), label);
}

function pressEscape() {
  press(Clutter.KEY_Escape);
}

async function checkMenus(app: LuftApp) {
  const empty = () => app.click(EMPTY_SPOT);
  empty();
  await pause(AFTER_PRESS_MS);
  const tileMenu = app.area(BESIDE_TILE);
  const boardMenu = app.area(BESIDE_BOARD);
  const popover = app.area(BELOW_SELECT);
  const [noTileMenu, noBoardMenu, noPopover] = [await app.frame(tileMenu), await app.frame(boardMenu), await app.frame(popover)];
  const openTile = () => app.click(FIRST_TILE, Clutter.BUTTON_SECONDARY);
  const openBoard = () => app.click(FIRST_BOARD, Clutter.BUTTON_SECONDARY);

  await opens(app, tileMenu, noTileMenu, 'right-clicking a tile opens its menu', openTile);
  await capture('soundboard-tile-menu');
  await closes(app, tileMenu, noTileMenu, 'clicking elsewhere closes the menu', empty);
  await opens(app, tileMenu, noTileMenu, 'the menu opens again', openTile);
  await closes(app, tileMenu, noTileMenu, 'Escape closes the menu', pressEscape);

  await opens(app, boardMenu, noBoardMenu, 'right-clicking a board opens its menu', openBoard);
  await closes(app, boardMenu, noBoardMenu, 'clicking elsewhere closes the board\'s menu', empty);
  await opens(app, boardMenu, noBoardMenu, 'the board\'s menu opens again', openBoard);
  await closes(app, boardMenu, noBoardMenu, 'Escape closes the board\'s menu', pressEscape);

  await opens(app, boardMenu, noBoardMenu, 'a board\'s menu is open', openBoard);
  await closes(app, boardMenu, noBoardMenu, 'right-clicking a tile closes the board\'s menu', openTile);
  await eventually(() => shows(app, tileMenu, noTileMenu), 'and opens the tile\'s, so only one is ever open');
  await closes(app, tileMenu, noTileMenu, 'right-clicking a board closes the tile\'s menu', openBoard);
  await eventually(() => shows(app, boardMenu, noBoardMenu), 'and opens the board\'s');
  await closes(app, boardMenu, noBoardMenu, 'and that one closes too', empty);

  await opens(app, tileMenu, noTileMenu, 'the tile\'s menu opens once more', openTile);
  await pause(AFTER_PRESS_MS);
  await opens(app, popover, noPopover, 'choosing Edit opens the editor', () => app.click(EDIT_ITEM));
  await pause(AFTER_PRESS_MS);
  await capture('soundboard-editor');
  await closes(app, tileMenu, noTileMenu, 'Escape closes the editor, and no menu is left behind', pressEscape);

  await opens(app, boardMenu, noBoardMenu, 'a board\'s menu opens for renaming', openBoard);
  await pause(AFTER_PRESS_MS);
  await opens(app, popover, noPopover, 'choosing Rename opens its dialog', () => app.click(RENAME_ITEM));
  await pause(AFTER_PRESS_MS);
  await capture('soundboard-rename');
  await closes(app, boardMenu, noBoardMenu, 'Escape closes the rename dialog', pressEscape);

  await pause(AFTER_PRESS_MS);
  const openSelect = () => app.click(MICROPHONE_SELECT);
  await opens(app, popover, noPopover, 'the microphone list opens', openSelect);
  await closes(app, popover, noPopover, 'clicking elsewhere closes the microphone list', empty);
  await pause(AFTER_PRESS_MS);
  await opens(app, popover, noPopover, 'the microphone list opens again', openSelect);
  await closes(app, popover, noPopover, 'Escape closes the microphone list', pressEscape);
}

/** Clicking a tile to close a menu mustn't play it into someone's call. */
async function checkDismissingIsSilent(app: LuftApp) {
  const heard = await listening(async () => {
    app.click(FIRST_TILE, Clutter.BUTTON_SECONDARY);
    await pause(AFTER_PRESS_MS);
    app.click(TILE_BESIDE_MENU);
    await pause(AFTER_PRESS_MS);
  });
  require(toneStrength(heard, SOUND_PITCH) < SILENT, `clicking a tile to close a menu plays nothing (${toneStrength(heard, SOUND_PITCH).toFixed(3)})`);
}

async function checkSoundAndVoice(app: LuftApp) {
  const recording = await listening(async () => {
    await eventually(() => hasNode(CAPTURE['node.name']), 'someone listening opens the real microphone');
    await eventually(async () => await givePorts(CAPTURE, 'Input', 2) &&
      await link(`${VOICE_NODE}:capture_FL`, 'soundboard-capture:input_FL') && await link(`${VOICE_NODE}:capture_FR`, 'soundboard-capture:input_FR'), 'the voice reaches the app');
    await pause(AFTER_PRESS_MS);
    require(Shell.Mixer.get_default().recording, 'the real microphone in use shows as in use');
    app.click(FIRST_TILE);
    await pause(AFTER_PRESS_MS);
  });
  const during = recording.subarray(-RATE / 2);
  require(toneStrength(recording, SOUND_PITCH) > SILENT * 2 && toneStrength(during, VOICE_PITCH) > HEARD, `the virtual microphone carries the sound (${toneStrength(recording, SOUND_PITCH).toFixed(3)}) and the voice (${toneStrength(during, VOICE_PITCH).toFixed(3)}) together`);
  await eventually(async () => !await hasNode(CAPTURE['node.name']), 'the real microphone closes when nobody listens');
}

async function checkPrivacy(app: LuftApp) {
  const mixer = Shell.Mixer.get_default();
  await eventually(() => !mixer.recording, 'nothing shows as recording while nobody listens');
  await eventually(() => intoSpeakers(MONITOR, 'soundboard-monitor:output', 2), 'the sounds reach the speakers');
  let seen = false;
  const watch = mixer.connect('notify::recording', () => (seen ||= mixer.recording));
  app.click(FIRST_TILE);
  await pause(AFTER_PRESS_MS * 2);
  mixer.disconnect(watch);
  require(!seen && !mixer.recording, 'playing a sound with nobody listening doesn\'t look like a call');
  await eventually(async () => !(await nodes()).some(props => props['node.name'] === CAPTURE['node.name']), 'playing a sound doesn\'t open the microphone');
}

async function checkHotkey(sound: number) {
  const stored = JSON.parse(settings.get_string('global-shortcuts')) as Record<string, Record<string, {description: string; shortcuts: string[]}>>;
  const own = stored[APP_ID];
  require(!!own?.[`sound-${sound}`], 'the app names itself to the portal and binds each sound');
  own[`sound-${sound}`].shortcuts = [ACCELERATOR];
  settings.set_string('global-shortcuts', JSON.stringify(stored));
}

async function checkPressed() {
  const heard = await listening(async () => {
    hold(...HOTKEY);
    await pause(AFTER_PRESS_MS);
    release(...HOTKEY);
  });
  require(toneStrength(heard, SOUND_PITCH) > SILENT, `the hotkey plays the sound into the virtual microphone (${toneStrength(heard, SOUND_PITCH).toFixed(3)})`);
}

async function checkLocked() {
  await lock();
  const heard = await listening(async () => {
    hold(...HOTKEY);
    await pause(AFTER_PRESS_MS);
    release(...HOTKEY);
  });
  await unlock();
  require(toneStrength(heard, SOUND_PITCH) < SILENT, `the hotkey does nothing on the lock screen (${toneStrength(heard, SOUND_PITCH).toFixed(3)})`);
}

function threads(pid: number) {
  const tasks = Gio.File.new_for_path(`/proc/${pid}/task`).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
  const found = new Map<string, {name: string; switches: number; onCpu: number}>();
  for (let task: Gio.FileInfo | null; (task = tasks.next_file(null));) {
    const folder = `/proc/${pid}/task/${task.get_name()}`;
    const status = read(`${folder}/status`);
    found.set(task.get_name(), {
      name: read(`${folder}/comm`).trim(),
      switches: Number(/\nvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]) + Number(/nonvoluntary_ctxt_switches:\s+(\d+)/.exec(status)![1]),
      onCpu: Number(read(`${folder}/schedstat`).split(' ')[0]),
    });
  }
  return found;
}

/** How often the app's threads wake while `milliseconds` pass, thread by thread, so one that ends can't hide the rest. */
async function wakeups(pid: number, milliseconds: number) {
  const before = threads(pid);
  await pause(milliseconds);
  let all = 0;
  let audio = 0;
  let onCpu = 0;
  for (const [id, thread] of threads(pid)) {
    const woke = thread.switches - (before.get(id)?.switches ?? 0);
    all += woke;
    onCpu += thread.onCpu - (before.get(id)?.onCpu ?? 0);
    if (AUDIO_THREAD.test(thread.name)) audio += woke;
  }
  const seconds = milliseconds / 1000;
  return {perSecond: all / seconds, audioPerSecond: audio / seconds, cpuPercent: onCpu / 1e9 / seconds * 100};
}

/** With the window closed nothing should wake the app: no audio callbacks, no timers. */
async function checkIdle(app: LuftApp) {
  const {pid} = app;
  app.window.delete(global.get_current_time());
  await eventually(() => app.window.get_compositor_private() === null || !app.running, 'the window closes');
  await pause(SETTLE_MS);
  require(app.running, 'with the setting on, the app keeps running with its window closed');
  require(await sourceIsReady(), 'the virtual microphone stays while the window is closed');
  const idle = await wakeups(pid, IDLE_MS);
  require(idle.audioPerSecond === 0 && idle.perSecond <= MOST_IDLE_WAKEUPS_PER_SECOND,
    `idle with the window closed it wakes ${idle.perSecond} times a second, its audio threads ${idle.audioPerSecond}, at ${idle.cpuPercent.toFixed(3)}% of a core, ${app.residentMb} MB resident`);
  return pid;
}

/** An app recording the virtual microphone costs nothing here while the voice is muted and no sound plays. */
async function checkListenerIdle(pid: number) {
  let quiet = {perSecond: 0, audioPerSecond: 0, cpuPercent: 0};
  let playing = {...quiet};
  const heard = await listening(async () => {
    await pause(SETTLE_MS);
    quiet = await wakeups(pid, IDLE_MS);
    hold(...HOTKEY);
    playing = await wakeups(pid, AFTER_PRESS_MS);
    release(...HOTKEY);
  });
  require(quiet.audioPerSecond === 0, `with an app listening and nothing to send, its audio threads wake ${quiet.audioPerSecond} times a second, at ${quiet.cpuPercent.toFixed(3)}% of a core`);
  require(playing.audioPerSecond > 0, `playing wakes them ${playing.audioPerSecond} times a second, at ${playing.cpuPercent.toFixed(3)}% of a core`);
  require(toneStrength(heard, SOUND_PITCH) > SILENT, `the hotkey still plays with the window closed (${toneStrength(heard, SOUND_PITCH).toFixed(3)})`);
}

async function checkReopens() {
  require((await launchAgain('soundboard', [])).ok, 'starting the app again reaches the one running');
  await waitForWindow('Soundboard', 'starting it again opens the window');
  require(await sourceIsReady(), 'starting it again adds no second virtual microphone');
}

async function defaultSource() {
  return (await outcome(['pactl', 'get-default-source'])).stdout.trim();
}

/** The default input is only taken on request, and given back when the app quits. */
async function checkDefaultInput() {
  require((await outcome(['pactl', 'set-default-source', 'microphone'])).ok, 'the computer has a default input');
  const before = await defaultSource();
  require(before !== SOURCE['node.name'], 'the virtual microphone doesn\'t become the default input by itself');
  writeSettings({...MIX_SETTINGS, useAsDefault: true});
  const app = await openApp('soundboard', [], environment());
  await eventually(async () => await defaultSource() === SOURCE['node.name'], 'asking makes it the default input');
  require(read(settingsFile()).includes(`"defaultBefore":"${before}"`), 'the app saves what to give back, in a folder its confinement lets it write');
  app.window.delete(global.get_current_time());
  await eventually(async () => !await hasNode(SOURCE['node.name']), 'closing the window quits the app');
  await eventually(async () => await defaultSource() === before, `quitting gives the default input back to ${before}`);
  await app.close();
}

async function checkCrash(app: LuftApp) {
  require(await sourceIsReady(), 'the virtual microphone is there before the crash');
  GLib.spawn_command_line_sync(`kill -9 ${app.pid}`);
  await eventually(async () => !await hasNode(SOURCE['node.name']), 'the virtual microphone goes away after a crash');
}

export async function run() {
  settings.reset('global-shortcuts');
  removeTree(dataFolder());
  removeTree(configFolder());
  const original = scratch('Airhorn.wav');
  write(original, tone(SOUND_PITCH, SOUND_SECONDS));
  const voiceFile = scratch('voice.wav');
  write(voiceFile, tone(VOICE_PITCH, VOICE_SECONDS));
  const voice: Process = spawn(['pw-play', '-P', `{ media.class = Audio/Source node.name = ${VOICE_NODE} }`, voiceFile]);
  await eventually(() => hasNode(VOICE_NODE), 'a fake microphone is there');
  await eventually(() => givePorts({'node.name': VOICE_NODE}, 'Output', 2), 'the fake microphone has ports');
  writeSettings(MIX_SETTINGS);
  try {
    const first = await openApp('soundboard', [], environment());
    try {
      await eventually(sourceIsReady, 'the virtual microphone appears as an input, once');
      await pause(AFTER_PRESS_MS);
      require(await sourceIsReady(), 'the window adds no second virtual microphone');
      await capture('soundboard-empty');
      await addSound(first, original);
      checkCopied(original);
      await capture('soundboard-board');
      await checkMenus(first);
      await checkDismissingIsSilent(first);
      await checkSoundAndVoice(first);
      await checkPrivacy(first);
      const sound = soundId()!;
      await checkHotkey(sound);
    } finally {
      await first.close();
    }
    await eventually(async () => !await hasNode(SOURCE['node.name']), 'the virtual microphone goes away when the app quits');

    writeSettings({mix: {microphone: VOICE_NODE, microphoneLevel: 1, microphoneMuted: true, monitorLevel: 0.7, monitorOn: false}, keepRunning: true});
    const second = await openApp('soundboard', [], environment());
    await eventually(sourceIsReady, 'the virtual microphone returns');
    await checkPressed();
    await checkLocked();
    await checkListenerIdle(await checkIdle(second));
    await checkReopens();
    await checkCrash(second);
    await checkDefaultInput();
  } finally {
    await stop(voice);
    settings.reset('global-shortcuts');
  }
}
