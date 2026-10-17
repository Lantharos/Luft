import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {pause, settled} from '../checks/lib/wait.js';

const POOL = 72;
const QUIET = 250;
const SAVE_WIDTH = 720;
const PROBE_WIDTH = 160;
const now = () => GLib.get_monotonic_time();

function primaryView(view) {
  const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  return view.layout.x === monitor.x && view.layout.y === monitor.y;
}

function composite(texture) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  return new Promise((resolve, reject) => Shell.Screenshot.composite_to_stream(texture, 0, 0, texture.get_width(), texture.get_height(),
    1, null, 0, 0, 1, stream, (_source, result) => {
      try {
        Shell.Screenshot.composite_to_stream_finish(result);
        stream.close(null);
        resolve(GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(stream.steal_as_bytes()), null));
      } catch (error) {
        reject(error);
      }
    }));
}

function luminance(pixbuf) {
  const height = Math.round(pixbuf.get_height() * PROBE_WIDTH / pixbuf.get_width());
  const small = pixbuf.scale_simple(PROBE_WIDTH, height, GdkPixbuf.InterpType.BILINEAR);
  const pixels = small.get_pixels();
  const [stride, channels] = [small.get_rowstride(), small.get_n_channels()];
  const out = new Float32Array(PROBE_WIDTH * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < PROBE_WIDTH; x++) {
      const o = y * stride + x * channels;
      out[y * PROBE_WIDTH + x] = 0.299 * pixels[o] + 0.587 * pixels[o + 1] + 0.114 * pixels[o + 2];
    }
  }
  return out;
}

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

const round = (value, places) => Math.round(value * 10 ** places) / 10 ** places;

class Film {
  constructor() {
    this.pool = [];
    this.frames = [];
  }

  start() {
    this.frames = [];
    this.lastPaint = now();
    this.signal = global.stage.connect_after('after-paint', (_stage, view) => {
      if (!primaryView(view)) return;
      this.lastPaint = now();
      this.ensurePool(view);
      if (this.frames.length >= POOL) return;
      const slot = this.pool[this.frames.length];
      const framebuffer = view.get_framebuffer();
      framebuffer.blit(slot.offscreen, 0, 0, 0, 0, framebuffer.get_width(), framebuffer.get_height());
      this.frames.push({slot, at: now()});
    });
  }

  stop() {
    if (this.signal) global.stage.disconnect(this.signal);
    this.signal = 0;
  }

  async quiet(timeout) {
    const deadline = now() + timeout * 1000;
    while (now() < deadline && now() - this.lastPaint < QUIET * 1000) await pause(16);
  }

  ensurePool(view) {
    if (this.pool.length) return;
    const framebuffer = view.get_framebuffer();
    for (let i = 0; i < POOL; i++) {
      const texture = Cogl.Texture2D.new_with_size(framebuffer.get_context(), framebuffer.get_width(), framebuffer.get_height());
      this.pool.push({texture, offscreen: Cogl.Offscreen.new_with_texture(texture)});
    }
  }

  async save(dir, startedAt, notes) {
    GLib.mkdir_with_parents(dir, 0o755);
    const probes = [];
    const frames = [];
    for (const [index, {slot, at}] of this.frames.entries()) {
      const pixbuf = await composite(slot.texture);
      const height = Math.round(pixbuf.get_height() * SAVE_WIDTH / pixbuf.get_width());
      pixbuf.scale_simple(SAVE_WIDTH, height, GdkPixbuf.InterpType.BILINEAR)
        .savev(GLib.build_filenamev([dir, `${String(index).padStart(3, '0')}.jpg`]), 'jpeg', ['quality'], ['88']);
      probes.push(luminance(pixbuf));
      frames.push({index, ms: round((at - startedAt) / 1000, 1)});
    }
    const last = probes.at(-1);
    const total = probes.length ? distance(probes[0], last) || 1 : 1;
    for (const [i, frame] of frames.entries()) {
      frame.progress = round(1 - distance(probes[i], last) / total, 3);
      frame.step = i ? round(distance(probes[i], probes[i - 1]), 2) : 0;
      frame.gap = i ? round(frames[i].ms - frames[i - 1].ms, 1) : 0;
    }
    GLib.file_set_contents(GLib.build_filenamev([dir, 'frames.json']), JSON.stringify({notes, frames}, null, 1));
    return frames;
  }
}

const film = new Film();

export async function clip(out, name, action, {notes = '', timeout = 6000} = {}) {
  try {
    film.start();
    global.stage.queue_redraw();
    await pause(40);
    const startedAt = now();
    await action();
    await film.quiet(timeout);
    film.stop();
    const frames = await film.save(GLib.build_filenamev([out, name]), startedAt, notes);
    console.log(`Kestrel motion: ${name}, ${frames.length} frames over ${frames.at(-1)?.ms ?? 0} ms`);
  } catch (error) {
    film.stop();
    console.log(`Kestrel motion: ${name} failed: ${error.message}`);
    logError(error, name);
  }
  await settled();
}
