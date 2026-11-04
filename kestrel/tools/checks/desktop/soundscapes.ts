import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';
import {PopupBaseMenuItem, QuickMenuToggle, toggleSurface} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {LEVEL_FLOOR_DB, loudness as speakersLoudness} from '../lib/audio/loudness.js';
import {intoSpeakers} from '../lib/audio/routing.js';
import {descendants, existing, ofType, shown, styled, textOf} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call} from '../lib/dbus.js';
import {click} from '../lib/input/input.js';
import {fixture, gjs, stop, stopAll, type Process} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {installBuilt, listed, request, setSetting} from '../extensions/lib/extensions.js';

const {require, eventually} = checks('Soundscapes');
const SOUNDSCAPES = 'com.lantharos.Soundscapes';
const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';
const SLEEP_LEFT_MS = 70000;
const SLEEP_FADE_MS = 60000;
const FADE_IN_MS = 3000;
const TILE_INSET = 40;
const AUDIBLY_QUIETER_DB = 4;
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const monitor = Shell.AudioMonitor.get_default();
const mixer = Shell.Mixer.get_default();

type PageItem = {type: string; title?: string; description?: string; action?: string; items?: {title: string}[]};

const quick = () => existing('kestrel-quick-settings');
const findTile = () => styled('kestrel-control', quick()).find(control => control instanceof QuickMenuToggle && control.title === 'Soundscapes') ?? null;
const tile = () => ofType(findTile(), QuickMenuToggle);
const subtitle = () => textOf(styled('kestrel-control-subtitle', tile())[0]);
const menuEntry = (label: string) => descendants(quick()).find(actor => actor instanceof PopupBaseMenuItem && shown(actor) && textOf(actor.label_actor) === label) as InstanceType<typeof PopupBaseMenuItem> | undefined;
const mixerWindow = () => descendants(global.stage).find(actor => actor.name === 'kestrel-extension-popup' && actor.mapped) ?? null;
const storageFile = () => GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${SOUNDSCAPES}.json`]);

async function page(): Promise<PageItem[]> {
  const [json] = (await call(NAME, PATH, IFACE, 'Page', new GLib.Variant('(s)', [SOUNDSCAPES]), '(s)')).deepUnpack<[string]>();
  return (JSON.parse(json) as {items: PageItem[]}[]).flatMap(section => section.items);
}

async function submit(title: string, text: string) {
  const entry = (await page()).find(item => item.type === 'entry' && item.title === title)!;
  await call(NAME, PATH, IFACE, 'Act', new GLib.Variant('(ssv)', [SOUNDSCAPES, entry.action!, new GLib.Variant('s', text)]));
}

const playingDetail = async () => (await page()).find(item => item.type === 'switch')?.description ?? '';

let routed = false;

/** Whether its sounds play, routed into the speakers once, the way a session manager would. */
const audible = async () => (routed ||= await intoSpeakers({'media.name': 'Soundscapes'}, 'Soundscapes:output', 2)) && mixer.playing;

async function loudness(): Promise<number> {
  await eventually(audible, 'its sounds reach the speakers');
  return speakersLoudness(eventually);
}

function clickTile() {
  if (!shown(quick())) toggleSurface('quick');
  const [x, y] = tile().get_transformed_position();
  click([x + TILE_INSET, y + tile().height / 2]);
}

async function openMenu() {
  if (!shown(quick())) toggleSurface('quick');
  const more = await eventually(() => shown(tile()) && styled('kestrel-control-more', tile())[0], 'Soundscapes has a quick settings tile with a menu');
  if (!menuEntry('Mixer')) (more as St.Button).emit('clicked', 1);
  await eventually(() => menuEntry('Mixer'), 'its arrow opens the mixes, the mixer and the sleep timer');
}

async function checkMixes() {
  await eventually(() => shown(tile()) && subtitle() === 'Rainy café', 'its tile names the mix it starts with');
  await capture('soundscapes-tile');
  await openMenu();
  await capture('soundscapes-menu');
  menuEntry('Deep focus')!.activate(Clutter.get_current_event());
  await eventually(() => tile().checked && subtitle() === 'Deep focus', 'picking a mix turns the tile on and names the mix');
  await eventually(audible, 'and plays it');
  await pause(FADE_IN_MS);
  const mix = await loudness();
  require(mix > LEVEL_FLOOR_DB + AUDIBLY_QUIETER_DB, `the mix can be heard (${mix.toFixed(1)} dB)`);

  await openMenu();
  menuEntry('Mixer')!.activate(Clutter.get_current_event());
  const window = await eventually(mixerWindow, 'the menu opens the mixer');
  await eventually(() => window.opacity === 255, 'the mixer fades in');
  toggleSurface('quick');
  await eventually(() => !shown(quick()), 'and stays when quick settings close');
  await settled();
  await capture('soundscapes-mixer');
  const brownNoise = descendants(window).find(actor => actor instanceof St.Widget && actor.has_style_class_name('slider') && actor.accessible_name === 'Brown noise') as unknown as {value: number};
  brownNoise.value = 1;
  await eventually(() => subtitle() === 'Custom mix', 'moving a sound away from the mix makes it a custom mix');
  await pause(FADE_IN_MS);
  const full = await loudness();
  require(full > mix + AUDIBLY_QUIETER_DB, `turning a sound up makes the mix louder (${mix.toFixed(1)} → ${full.toFixed(1)} dB)`);
  brownNoise.value = 0;
  await pause(FADE_IN_MS);
  const softer = await loudness();
  require(softer < full - AUDIBLY_QUIETER_DB, `turning the loudest sound off makes the mix quieter (${full.toFixed(1)} → ${softer.toFixed(1)} dB)`);
  (descendants(window).find(actor => actor instanceof St.Button && actor.accessible_name === 'Close') as St.Button).emit('clicked', 1);

  await submit('Save as a new mix', 'Night shift');
  await eventually(() => subtitle() === 'Night shift', 'a mix saved under a name of its own shows on the tile');
  await eventually(async () => (await page()).some(item => item.type === 'list' && item.items!.some(mix => mix.title === 'Night shift')), 'and joins the list of mixes');
  await submit('Name of this mix', 'Late shift');
  await eventually(() => subtitle() === 'Late shift', 'it can be renamed');
}

function player(): Process {
  return gjs('clients/apps/musicPlayer.js', ['KestrelCheckMusic', 'Tunes', 'Evening Edition', 'Station Nine', fixture('media', 'cover.png')]);
}

async function checkMedia() {
  const music = player();
  try {
    await eventually(async () => !mixer.playing && await playingDetail() === 'Waiting while something else plays', 'music in another app fades it out until it stops', 8000);
    require(tile().checked, 'while the tile stays on');
    await call('org.mpris.MediaPlayer2.KestrelCheckMusic', '/org/mpris/MediaPlayer2', 'org.mpris.MediaPlayer2.Player', 'PlayPause', null);
    await eventually(audible, 'pausing the music brings it back', 8000);
  } finally {
    await stop(music);
  }
}

/** Plays with a sleep timer that has little time left, the way Kestrel finds it stored when it starts the extension. */
async function checkSleepTimer() {
  await setSetting(SOUNDSCAPES, 'sleep-timer', new GLib.Variant('s', '15'));
  await request('Disable', SOUNDSCAPES);
  const deadline = Date.now() + SLEEP_LEFT_MS;
  GLib.mkdir_with_parents(GLib.path_get_dirname(storageFile()), 0o700);
  GLib.file_set_contents(storageFile(), JSON.stringify({'sleep-at': deadline}));
  await request('Reload', SOUNDSCAPES);
  await request('Enable', SOUNDSCAPES);
  toggleSurface('quick');
  await eventually(() => findTile()?.mapped, 'Soundscapes has a quick settings tile');
  await settled();
  clickTile();
  await eventually(async () => tile().checked && (await playingDetail()).startsWith('Stops at'), 'playing before the sleep timer runs out counts toward it');
  await eventually(audible, 'it plays');
  await pause(FADE_IN_MS);
  const early = await loudness();
  await pause(deadline - SLEEP_FADE_MS / 2 - Date.now());
  const late = await loudness();
  require(late < early - AUDIBLY_QUIETER_DB, `in its last minute it fades out (${early.toFixed(1)} → ${late.toFixed(1)} dB)`);
  await eventually(() => !tile().checked && !mixer.playing, 'and then stops', SLEEP_FADE_MS);
  await setSetting(SOUNDSCAPES, 'sleep-timer', new GLib.Variant('s', 'off'));
}

export async function run() {
  await installBuilt(SOUNDSCAPES);
  try {
    await eventually(async () => (await listed(SOUNDSCAPES))?.state === 'running', 'Soundscapes runs once installed');
    await setSetting(SOUNDSCAPES, 'volume', new GLib.Variant('d', 1));
    await checkSleepTimer();
    await checkMixes();
    await checkMedia();
  } finally {
    monitor.set_listening(false);
    if (shown(quick())) toggleSurface('quick');
    await request('Remove', SOUNDSCAPES);
    await stopAll();
    kestrel.reset('extension-settings');
  }
}
