import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {descendants, named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {checkWallpaperModes} from './wallpaper/modes.js';
import {framesOn, makeVideo, wallpapers} from './wallpaper/video.js';

const {require, eventually} = checks('live wallpaper');
const VIDEO_TIMEOUT = 10000;
const SAMPLE = 500;
const PLAYING_FRAMES = 5;
const IDLE_FRAMES = 1;

const plays = async monitor => await framesOn(monitor, SAMPLE) >= PLAYING_FRAMES;

function fillsDisplays(actors, monitors) {
  return actors.every(actor => {
    const frame = actor.meta_window.get_frame_rect();
    const monitor = monitors[actor.meta_window.get_monitor()];
    return frame.x === monitor.x && frame.y === monitor.y && frame.width === monitor.width && frame.height === monitor.height;
  });
}

async function checkPlaying(picture, darkPicture) {
  const monitors = Main.layoutManager.monitors;
  await eventually(() => wallpapers().length === monitors.length && wallpapers().every(actor => actor.opacity === 255),
    'a video plays behind each display', VIDEO_TIMEOUT);
  const actors = wallpapers();
  await eventually(() => fillsDisplays(actors, monitors), 'each video fills its display');
  const tabList = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, null);
  require(actors.every(actor => actor.meta_window.is_skip_taskbar() && !tabList.includes(actor.meta_window)) &&
    !descendants(named('kestrel-panel')).some(actor => actor.name?.includes('Wallpaper')), 'the video stays out of the taskbar and window switchers');
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  await eventually(() => {
    const still = background.get_string('picture-uri');
    return still !== picture && Gio.File.new_for_uri(still).query_exists(null);
  }, 'the lock screen and task view get a still frame');
  require(background.get_string('picture-uri-dark') === darkPicture, 'the dark wallpaper stays as it was');
  const [x, y] = [monitors[0].x + monitors[0].width / 2, monitors[0].y + monitors[0].height / 2];
  require(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y) instanceof Meta.BackgroundActor, 'clicks pass through the video to the desktop');
  await eventually(() => plays(monitors[0]), 'the video plays');
  return actors;
}

async function checkCovered(actors) {
  const app = gjs('clients/window.js');
  const window = await waitForWindow('Kestrel window check');
  const stack = global.get_window_actors();
  require(actors.every(actor => stack.indexOf(actor) < stack.indexOf(window.get_compositor_private())), 'app windows stay above the video');
  const covered = Main.layoutManager.monitors[window.get_monitor()];
  window.maximize();
  await eventually(async () => window.is_maximized() && await framesOn(covered, SAMPLE) <= IDLE_FRAMES, 'a covered video stops repainting its display');
  window.unmaximize();
  await eventually(() => plays(covered), 'the video resumes once uncovered');

  const manager = global.workspace_manager;
  const panel = named('kestrel-panel');
  manager.get_workspace_by_index(1).activate(global.get_current_time());
  await eventually(() => manager.get_active_workspace_index() === 1 && panel.visible && panel.mapped, 'the panel stays on an empty workspace in front of the video');
  manager.get_workspace_by_index(0).activate(global.get_current_time());
  await stop(app);
  require(!actors.some(actor => actor.meta_window === global.display.focus_window), 'the video never takes focus');
}

export async function run() {
  const video = await makeVideo('ball', 'light');
  const kestrel = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  const picture = background.get_string('picture-uri');
  const darkPicture = background.get_string('picture-uri-dark');
  interfaceSettings.set_string('color-scheme', 'default');
  kestrel.set_string('live-wallpaper', video.get_uri());
  try {
    const actors = await checkPlaying(picture, darkPicture);
    await checkCovered(actors);
    await checkWallpaperModes(darkPicture);
    background.set_string('picture-uri', picture);
    background.set_string('picture-uri-dark', darkPicture);
    await eventually(() => kestrel.get_string('live-wallpaper') === '' && wallpapers().every(actor => actor.opacity === 0),
      'choosing a picture ends the live wallpaper');
  } finally {
    kestrel.reset('live-wallpaper');
    background.set_string('picture-uri', picture);
    background.set_string('picture-uri-dark', darkPicture);
    interfaceSettings.set_string('color-scheme', colorScheme);
    video.delete(null);
  }
}
