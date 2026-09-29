import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {checkWallpaperModes} from './wallpaperModeChecks.js';

const VIDEO = 'num-buffers=90 ! video/x-raw,width=1280,height=720,framerate=30/1 ! x264enc ! mp4mux';

function run(argv) {
  const process = Gio.Subprocess.new(argv, Gio.SubprocessFlags.NONE);
  return new Promise((resolve, reject) => process.wait_check_async(null, (_process, result) => {
    try {
      resolve(process.wait_check_finish(result));
    } catch (error) {
      reject(error);
    }
  }));
}

export async function checkLiveWallpaper({pause, actorNamed}) {
  const require = (condition, label) => {
    if (!condition) throw new Error(`Kestrel live wallpaper check failed: ${label}`);
    console.log(`Kestrel live wallpaper check: ${label}`);
  };
  const descendants = actor => [actor, ...actor.get_children().flatMap(descendants)];
  const wallpapers = () => global.get_window_actors().filter(actor => actor.meta_window.get_window_type() === Meta.WindowType.DESKTOP);
  const framesPerSecond = async monitor => {
    let frames = 0;
    const counter = global.stage.connect('after-paint', (_stage, view) => {
      const layout = new Mtk.Rectangle();
      view.get_layout(layout);
      if (layout.x === monitor.x && layout.y === monitor.y) frames++;
    });
    await pause(1000);
    global.stage.disconnect(counter);
    return frames;
  };

  const makeVideo = async (pattern, name) => {
    const file = Gio.File.new_for_path(`${GLib.getenv('XDG_CACHE_HOME')}/live-wallpaper-${name}.mp4`);
    await run(['gst-launch-1.0', '-q', 'videotestsrc', `pattern=${pattern}`, ...VIDEO.split(' '), '!', 'filesink', `location=${file.get_path()}`]);
    return file;
  };
  const video = await makeVideo('ball', 'light');
  const kestrel = new Gio.Settings({schema_id: 'dev.lantharos.kestrel'});
  const background = new Gio.Settings({schema_id: 'org.gnome.desktop.background'});
  const interfaceSettings = new Gio.Settings({schema_id: 'org.gnome.desktop.interface'});
  const colorScheme = interfaceSettings.get_string('color-scheme');
  const picture = background.get_string('picture-uri');
  const darkPicture = background.get_string('picture-uri-dark');
  interfaceSettings.set_string('color-scheme', 'default');

  kestrel.set_string('live-wallpaper', video.get_uri());
  await pause(2500);
  const actors = wallpapers();
  const monitors = Main.layoutManager.monitors;
  require(actors.length === monitors.length && actors.every(actor => actor.opacity === 255), 'a video plays behind each display');
  require(actors.every(actor => {
    const frame = actor.meta_window.get_frame_rect();
    const monitor = monitors[actor.meta_window.get_monitor()];
    return frame.x === monitor.x && frame.y === monitor.y && frame.width === monitor.width && frame.height === monitor.height;
  }), 'each video fills its display');
  const panel = actorNamed(global.stage, 'kestrel-panel');
  const tabList = global.display.get_tab_list(Meta.TabList.NORMAL_ALL, null);
  require(actors.every(actor => actor.meta_window.is_skip_taskbar() && !tabList.includes(actor.meta_window)) &&
    !descendants(panel).some(actor => actor.name?.includes('Wallpaper')), 'the video stays out of the taskbar and window switchers');
  const still = background.get_string('picture-uri');
  require(still !== picture && Gio.File.new_for_uri(still).query_exists(null), 'the lock screen and task view get a still frame');
  require(background.get_string('picture-uri-dark') === darkPicture, 'the dark wallpaper stays as it was');
  const [x, y] = [monitors[0].x + monitors[0].width / 2, monitors[0].y + monitors[0].height / 2];
  require(global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y) instanceof Meta.BackgroundActor, 'clicks pass through the video to the desktop');
  require(await framesPerSecond(monitors[0]) >= 10, 'the video plays');

  const app = Gio.Subprocess.new(['gjs', '-m', GLib.getenv('KESTREL_WINDOW_SCRIPT')], Gio.SubprocessFlags.NONE);
  try {
    await pause(1100);
    const window = global.get_window_actors().find(actor => actor.meta_window.get_title() === 'Kestrel window check');
    const stack = global.get_window_actors();
    require(actors.every(actor => stack.indexOf(actor) < stack.indexOf(window)), 'app windows stay above the video');
    const covered = monitors[window.meta_window.get_monitor()];
    window.meta_window.maximize();
    await pause(600);
    require(await framesPerSecond(covered) <= 2, 'a covered video stops repainting its display');
    window.meta_window.unmaximize();
    await pause(600);
    require(await framesPerSecond(covered) >= 10, 'the video resumes once uncovered');
    const manager = global.workspace_manager;
    manager.get_workspace_by_index(1).activate(global.get_current_time());
    await pause(800);
    require(manager.get_active_workspace_index() === 1 && panel.visible && panel.mapped, 'the panel stays on an empty workspace in front of the video');
    manager.get_workspace_by_index(0).activate(global.get_current_time());
    await pause(800);
  } finally {
    app.force_exit();
  }
  await pause(600);
  require(!actors.some(actor => actor.meta_window === global.display.focus_window), 'the video never takes focus');

  await checkWallpaperModes({pause, require, wallpapers, video: makeVideo, darkPicture});

  background.set_string('picture-uri', picture);
  background.set_string('picture-uri-dark', darkPicture);
  await pause(900);
  require(kestrel.get_string('live-wallpaper') === '' && wallpapers().every(actor => actor.opacity === 0), 'choosing a picture ends the live wallpaper');
  interfaceSettings.set_string('color-scheme', colorScheme);
  video.delete(null);
}
