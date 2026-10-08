import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Mtk from 'gi://Mtk';

import {scratch, spawn} from '../../lib/processes.js';
import {pause} from '../../lib/wait.js';

const VIDEO = 'num-buffers=90 ! video/x-raw,width=1280,height=720,framerate=30/1 ! x264enc ! mp4mux';

export const wallpapers = () => global.get_window_actors().filter(actor => actor.meta_window.get_window_type() === Meta.WindowType.DESKTOP);

export async function makeVideo(pattern, name) {
  const file = Gio.File.new_for_path(scratch(`live-wallpaper-${name}.mp4`));
  const encoder = spawn(['gst-launch-1.0', '-q', 'videotestsrc', `pattern=${pattern}`, ...VIDEO.split(' '), '!', 'filesink', `location=${file.get_path()}`]);
  await encoder.exited;
  if (!encoder.get_successful()) throw new Error(`The ${name} test video could not be made`);
  return file;
}

export async function framesOn(monitor, milliseconds) {
  let frames = 0;
  const counter = global.stage.connect('after-paint', (_stage, view) => {
    const layout = new Mtk.Rectangle();
    view.get_layout(layout);
    if (layout.x === monitor.x && layout.y === monitor.y) frames++;
  });
  await pause(milliseconds);
  global.stage.disconnect(counter);
  return frames;
}
