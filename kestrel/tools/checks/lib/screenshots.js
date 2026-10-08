import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {settled} from './wait.js';

const SAMPLE_STEP = 3;
const CAPTURE_SETTLE = 1000;
const channels = hex => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));

export const output = name => GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR'), `${name}.png`]);
const pathFor = name => GLib.path_is_absolute(name) ? name : output(name);

function finish(source, result, method, resolve, reject) {
  try {
    source[method](result);
    resolve();
  } catch (error) {
    reject(error);
  }
}

async function shoot(stream, area = null) {
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => {
    if (area) {
      const {x, y, width, height} = area;
      screenshot.screenshot_area(x, y, width, height, stream,
        (source, result) => finish(source, result, 'screenshot_area_finish', resolve, reject));
    } else {
      screenshot.screenshot(false, stream, (source, result) => finish(source, result, 'screenshot_finish', resolve, reject));
    }
  });
  stream.close(null);
}

export async function capture(name) {
  await settled(CAPTURE_SETTLE);
  await shoot(Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null));
}

export async function screenshot(area = null) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  await shoot(stream, area);
  return stream.steal_as_bytes();
}

export class Frame {
  constructor(bytes) {
    this.bytes = bytes;
    this._pixbuf = GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(bytes), null);
    this._pixels = this._pixbuf.get_pixels();
  }

  get pixbuf() {
    return this._pixbuf;
  }

  count(colors, tolerance) {
    const targets = colors.map(channels);
    const [stride, size] = [this._pixbuf.get_rowstride(), this._pixbuf.get_n_channels()];
    let matches = 0;
    for (let y = 0; y < this._pixbuf.get_height(); y += SAMPLE_STEP) {
      for (let x = 0; x < this._pixbuf.get_width(); x += SAMPLE_STEP) {
        const offset = y * stride + x * size;
        if (targets.some(target => target.every((value, channel) => Math.abs(this._pixels[offset + channel] - value) <= tolerance))) matches++;
      }
    }
    return matches;
  }

  share(colors, tolerance) {
    const samples = Math.ceil(this._pixbuf.get_width() / SAMPLE_STEP) * Math.ceil(this._pixbuf.get_height() / SAMPLE_STEP);
    return this.count(colors, tolerance) / samples;
  }

  near(x, y, color, tolerance) {
    const offset = y * this._pixbuf.get_rowstride() + x * this._pixbuf.get_n_channels();
    return channels(color).every((value, channel) => Math.abs(this._pixels[offset + channel] - value) <= tolerance);
  }

  same(other) {
    return other?.bytes.compare(this.bytes) === 0;
  }

  looksLike(other, tolerance = 0) {
    return this._pixels.length === other._pixels.length && this._pixels.every((value, index) => Math.abs(value - other._pixels[index]) <= tolerance);
  }

  save(name) {
    GLib.file_set_contents(output(name), this.bytes.toArray());
  }

  saveZoomed(name, factor) {
    this._pixbuf.scale_simple(this._pixbuf.get_width() * factor, this._pixbuf.get_height() * factor, GdkPixbuf.InterpType.NEAREST)
      .savev(output(name), 'png', [], []);
  }
}

export async function captureFrame(area = null) {
  return new Frame(await screenshot(area));
}

export async function captureRenderedFrames(name, action) {
  let texture = null;
  let snapshot = null;
  const signal = global.stage.connect('after-paint', (_stage, view) => {
    const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
    if (view.layout.x !== monitor.x || view.layout.y !== monitor.y) return;
    const framebuffer = view.get_framebuffer();
    const [width, height] = [framebuffer.get_width(), framebuffer.get_height()];
    if (!snapshot) {
      texture = Cogl.Texture2D.new_with_size(framebuffer.get_context(), width, height);
      snapshot = Cogl.Offscreen.new_with_texture(texture);
    }
    framebuffer.blit(snapshot, 0, 0, 0, 0, width, height);
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  if (!texture) throw new Error('No frame was rendered during capture');
  const stream = Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null);
  try {
    await new Promise((resolve, reject) => Shell.Screenshot.composite_to_stream(texture, 0, 0, texture.get_width(), texture.get_height(),
      1, null, 0, 0, 1, stream, (_source, result) => {
        try {
          Shell.Screenshot.composite_to_stream_finish(result);
          resolve();
        } catch (error) {
          reject(error);
        }
      }));
  } finally {
    stream.close(null);
  }
}

export async function captureArea(name, area) {
  await settled(CAPTURE_SETTLE);
  await shoot(Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null), area);
}
