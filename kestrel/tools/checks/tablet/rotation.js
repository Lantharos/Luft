import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import * as Main from 'resource:///com/lantharos/kestrel/ui/main.js';

import {named} from '../lib/actors.js';
import {checks} from '../lib/check.js';
import {call as callBus} from '../lib/dbus.js';
import {gjs, stop, waitForWindow} from '../lib/processes.js';
import {capture} from '../lib/screenshots.js';
import {pause, settled} from '../lib/wait.js';
import {clip} from '../../motion/film.js';

const {require, eventually} = checks('rotation');
const TEMPORARY = 1;
const BLACK = 12;
const MOSTLY_BLACK = 0.5;
const PROBE = 96;
const SAME_PICTURE = 3;
const clips = GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), 'clips']);

async function call(method, parameters = null) {
  const reply = await callBus('org.gnome.Mutter.DisplayConfig', '/org/gnome/Mutter/DisplayConfig', 'org.gnome.Mutter.DisplayConfig', method, parameters);
  return reply.deepUnpack();
}

async function rotate(transform) {
  const [serial, monitors, logicalMonitors] = await call('GetCurrentState');
  const currentMode = connector => monitors.find(([[name]]) => name === connector)[1]
    .find(([, , , , , , properties]) => properties['is-current']?.deepUnpack())[0];
  const layout = logicalMonitors.map(([x, y, scale, , primary, specs]) =>
    [x, y, scale, transform, primary, specs.map(([connector]) => [connector, currentMode(connector), {}])]);
  await call('ApplyMonitorsConfig', new GLib.Variant('(uua(iiduba(ssa{sv}))a{sv})', [serial, TEMPORARY, layout, {}]));
}

function blackShare(path) {
  const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, PROBE, -1, true);
  const pixels = pixbuf.get_pixels();
  const [stride, channels] = [pixbuf.get_rowstride(), pixbuf.get_n_channels()];
  let black = 0;
  for (let y = 0; y < pixbuf.get_height(); y++) {
    for (let x = 0; x < pixbuf.get_width(); x++) {
      const offset = y * stride + x * channels;
      if (Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) < BLACK) black++;
    }
  }
  return black / (pixbuf.get_width() * pixbuf.get_height());
}

function copyOf(framebuffer) {
  const texture = Cogl.Texture2D.new_with_size(framebuffer.get_context(), framebuffer.get_width(), framebuffer.get_height());
  framebuffer.blit(Cogl.Offscreen.new_with_texture(texture), 0, 0, 0, 0, framebuffer.get_width(), framebuffer.get_height());
  return texture;
}

function probe(texture) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  return new Promise((resolve, reject) => Shell.Screenshot.composite_to_stream(texture, 0, 0, texture.get_width(), texture.get_height(),
    1, null, 0, 0, 1, stream, (_source, result) => {
      try {
        Shell.Screenshot.composite_to_stream_finish(result);
        stream.close(null);
        const pixbuf = GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(stream.steal_as_bytes()), null);
        resolve(pixbuf.scale_simple(PROBE, PROBE, GdkPixbuf.InterpType.BILINEAR).get_pixels());
      } catch (error) {
        reject(error);
      }
    }));
}

async function panelDifference(rotation) {
  let before = null;
  let after = null;
  let turned = false;
  const signal = global.stage.connect_after('after-paint', (_stage, view) => {
    if (!turned) before = copyOf(view.get_onscreen());
    else after ??= copyOf(view.get_onscreen());
  });
  global.stage.queue_redraw();
  await pause(50);
  await rotation();
  turned = true;
  await pause(100);
  global.stage.disconnect(signal);
  const [a, b] = [await probe(before), await probe(after)];
  return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0) / a.length;
}

function framesOf(name) {
  const dir = GLib.build_filenamev([clips, name]);
  const {frames} = JSON.parse(new TextDecoder().decode(GLib.file_get_contents(GLib.build_filenamev([dir, 'frames.json']))[1]));
  return frames.map(({index}) => GLib.build_filenamev([dir, `${String(index).padStart(3, '0')}.jpg`]));
}

async function turn(name, transform, window) {
  const before = {...Main.layoutManager.primaryMonitor};
  let overlaid = false;
  let difference = Infinity;
  await clip(clips, name, async () => {
    difference = await panelDifference(async () => {
      await rotate(transform);
      overlaid = !!named('kestrel-rotation');
    });
  }, {notes: `Turned the display to transform ${transform}`});
  const after = Main.layoutManager.primaryMonitor;
  require(overlaid, 'the old picture covers the screen as soon as it turns');
  require(difference < SAME_PICTURE, 'the screen shows the same picture right after it turns, before it animates');
  require(after.width === before.height && after.height === before.width, 'the display swaps its width and height');
  await eventually(() => !named('kestrel-rotation'), 'the turn finishes and leaves nothing behind');
  const frames = framesOf(name);
  require(frames.length > 8, 'the turn animates over several frames');
  require(frames.every(frame => blackShare(frame) < MOSTLY_BLACK), 'no frame of the turn goes black');
  await eventually(() => {
    const area = Main.layoutManager.getWorkAreaForMonitor(after.index);
    const frame = window.get_frame_rect();
    return frame.width === area.width && frame.height === area.height;
  }, 'maximized windows fill the turned display');
}

export async function run() {
  const app = gjs('clients/windows/window.js');
  try {
    const window = await waitForWindow('Kestrel window check');
    window.maximize();
    await settled();
    await turn('rotation-portrait', 1, window);
    await capture('rotation-portrait');
    await turn('rotation-landscape', 0, window);
  } finally {
    await stop(app);
  }
}
