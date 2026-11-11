import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import {QuickMenuToggle} from 'resource:///com/lantharos/kestrel/kestrel.js';

import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {hold, press, release} from '../lib/input/input.js';
import {fixture, gjs, stop, stopAll, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause} from '../lib/wait.js';
import {focus, openWindow} from '../tiling/lib/tiling.js';
import {layerSheets, request, SEASONS, setSetting} from '../extensions/lib/extensions.js';
import {checkParting, listening, partsForPointer} from './lib/seasonsParting.js';
import {litShares, liveCost, onLiveWallpaper, paintsBetween, topOfDesktop} from './wallpaper/overlays.js';
import {framesOn} from './wallpaper/video.js';

const {require, eventually} = checks('seasons');
const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
const SETTLING_MS = 20000;
const RAIN_SHARE = 0.002;
const BY_MONTH = ['Snow', 'Snow', 'Rain', 'Rain', 'Rain', null, null, null, 'Autumn leaves', 'Autumn leaves', 'Autumn leaves', 'Snow'];

function primarySheets() {
  const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  return layerSheets(SEASONS).filter(actor => actor.x === monitor.x && actor.y === monitor.y);
}

const falling = () => primarySheets().some(sheet => sheet.visible && sheet.opacity === 255);
const dry = () => !primarySheets().some(sheet => sheet.visible);
const tile = () => descendants(named('kestrel-quick-settings')!).find(actor => actor instanceof QuickMenuToggle && actor.title === 'Seasons') as InstanceType<typeof QuickMenuToggle> | undefined;
const subtitle = () => tile()?.subtitle ?? null;

const choose = (key: string, value: string) => setSetting(SEASONS, key, new GLib.Variant('s', value));

async function show(effect: string, label: string) {
  await choose('effect', effect);
  await eventually(() => subtitle() === label && primarySheets().length === 1 && falling(), `choosing ${label} lets it take over from the effect before`, 15000);
}

async function activate(index: number) {
  hold(Clutter.KEY_Super_L);
  press(Clutter.KEY_1 + index);
  release(Clutter.KEY_Super_L);
  await eventually(() => global.workspace_manager.get_active_workspace_index() === index, `Super+${index + 1} switches to workspace ${index + 1}`);
}

async function checkEffects() {
  await setSetting(SEASONS, 'on', new GLib.Variant('b', true));
  await eventually(falling, 'rain falls over the wallpaper');
  await checkParting();
  await choose('intensity', 'heavy');
  await eventually(() => subtitle() === 'Storm', 'the tile says it storms');
  const {window} = await openWindow('Sheltering', 640, 360);
  window.move_frame(true, 360, 260);
  await pause(1500);
  await capture('seasons-rain');

  await show('snow', 'Snow');
  await partsForPointer('snow', 'seasons-snow-parted');
  await pause(SETTLING_MS);
  await capture('seasons-snow');
  kestrel.set_boolean('rounded-window-corners', false);
  await pause(3000);
  await capture('seasons-snow-square');
  kestrel.reset('rounded-window-corners');
  await show('leaves', 'Autumn leaves');
  await pause(4000);
  await capture('seasons-leaves');
  await partsForPointer('leaves', 'seasons-leaves-parted');
  await show('fireflies', 'Fireflies');
  await pause(4000);
  await capture('seasons-fireflies');
  await show('fog', 'Mist');
  await pause(3000);
  await capture('seasons-fog');
}

async function checkIslands() {
  kestrel.set_string('taskbar-style', 'separate');
  await show('rain', 'Storm');
  await pause(2000);
  await capture('seasons-rain-islands');
  await show('snow', 'Snow');
  await pause(SETTLING_MS);
  await capture('seasons-snow-islands');
  kestrel.reset('taskbar-style');
  await choose('effect', 'rain');
}

function keepPictures(landing: string) {
  const folder = GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', SEASONS, 'picked']);
  GLib.mkdir_with_parents(folder, 0o700);
  const picture = GLib.build_filenamev([folder, 'shell.svg']);
  Gio.File.new_for_path(fixture('pictures', 'shell.svg')).copy(Gio.File.new_for_path(picture), Gio.FileCopyFlags.OVERWRITE, null, null);
  const preset = {id: 'shells', name: 'Shells', pictures: [picture], amount: 0.5, smallest: 30, largest: 52, speed: 220, wind: 0.15, spin: 0.6, landing, impact: null};
  const storage = GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage']);
  GLib.mkdir_with_parents(storage, 0o700);
  GLib.file_set_contents(GLib.build_filenamev([storage, `${SEASONS}.json`]), JSON.stringify({'custom-presets': [preset], 'custom-preset': 'shells'}));
}

async function checkPictures() {
  for (const landing of ['bounce', 'settle']) {
    keepPictures(landing);
    await request('Reload', SEASONS);
    await show('custom', 'Shells');
    await pause(5000);
    await capture(`seasons-custom-${landing}`);
  }
  await partsForPointer('pictures', 'seasons-custom-parted');
  await choose('effect', 'rain');
}

async function checkFollowing() {
  const seasonal = BY_MONTH[new Date().getMonth()];
  await choose('effect', 'season');
  if (seasonal) await eventually(() => subtitle() === seasonal && falling(), `following the season shows ${seasonal} by the calendar while the weather is unknown`, 15000);
  else await eventually(() => subtitle() === 'Calm outside', 'following the season on a summer day without weather leaves the sky calm');
  await choose('effect', 'weather');
  await eventually(() => subtitle() === 'Calm outside' && !layerSheets(SEASONS).length, 'following the weather without knowing it leaves the sky calm', 15000);
  await choose('effect', 'rain');
}

async function showsOverVideo(label: string) {
  const shares = await eventually(async () => {
    const lit = await litShares(topOfDesktop());
    return Math.min(...lit) > RAIN_SHARE && lit;
  }, label);
  console.log(`Kestrel seasons, ${label}: ${shares.map(share => share.toFixed(4)).join(', ')} of the top of the desktop lit in successive frames`);
}

async function checkOverLiveWallpaper() {
  await onLiveWallpaper(eventually, async () => {
    await eventually(falling, 'rain keeps falling over a live wallpaper');
    await showsOverVideo('it shows over the video in every frame');
    await capture('seasons-live-wallpaper');
    await liveCost('with rain falling over it');
    const {window: lower} = await openWindow('Under the raised one', 480, 320);
    const {window: raised} = await openWindow('Raised over the rain', 480, 320);
    await focus(lower);
    require(primarySheets().every(sheet => paintsBetween(sheet, [lower, raised])), 'the rain draws over the video and under both windows after they restack');
    for (const window of [lower, raised]) window.delete(global.get_current_time());

    const app = gjs('clients/windows/window.js');
    const covering = await waitForWindow('Kestrel window check');
    covering.maximize();
    await eventually(dry, 'a maximized window hides it over a live wallpaper');
    const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
    await eventually(async () => await framesOn(monitor, 500) <= 1, 'and the covered display stops repainting');
    covering.unmaximize();
    await eventually(falling, 'unmaximizing the window brings it back over the video');
    await showsOverVideo('it shows over the video again');
    await stop(app);
  });
}

async function checkCovered() {
  await eventually(falling, 'rain falls again');
  const {window} = await openWindow('Covering');
  window.maximize();
  await eventually(dry, 'a maximized window hides it');
  await eventually(() => !listening(), 'and nothing listens to the pointer while it can\'t show');

  const {window: small} = await openWindow('Small', 360, 240);
  small.change_workspace_by_index(1, false);
  await eventually(() => global.workspace_manager.n_workspaces > 2, 'the small window gets a workspace of its own');
  await activate(1);
  await eventually(falling, 'switching to a workspace whose window leaves the wallpaper showing brings it back');
  await activate(0);
  await eventually(dry, 'switching back to the maximized window hides it again');

  await activate(1);
  await eventually(falling, 'it is back on the second workspace');
  await setSetting(SEASONS, 'on', new GLib.Variant('b', false));
  await eventually(() => !layerSheets(SEASONS).length && subtitle() === null, 'turning Seasons off lets it wind down and its layers go', 15000);
}

export async function run() {
  const forced = global.force_animations;
  global.force_animations = true;
  try {
    await checkEffects();
    await checkIslands();
    await checkPictures();
    await checkFollowing();
    await checkOverLiveWallpaper();
    await checkCovered();
  } finally {
    for (const key of ['extension-settings', 'rounded-window-corners', 'taskbar-style']) kestrel.reset(key);
    await activate(0).catch(() => {});
    await stopAll();
    global.force_animations = forced;
  }
}

export const timeout = 420000;
