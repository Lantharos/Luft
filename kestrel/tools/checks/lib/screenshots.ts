import type Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {settled} from './wait.js';

const SAMPLE_STEP = 3;
const CAPTURE_SETTLE = 1000;
export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const channels = (hex: string) => [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));

export const output = (name: string) => GLib.build_filenamev([GLib.getenv('KESTREL_CAPTURE_DIR')!, `${name}.png`]);
const pathFor = (name: string) => GLib.path_is_absolute(name) ? name : output(name);

function finish(finishing: () => void, resolve: () => void, reject: (error: unknown) => void) {
  try {
    finishing();
    resolve();
  } catch (error) {
    reject(error);
  }
}

async function shoot(stream: Gio.OutputStream, area: Area | null = null) {
  const screenshot = new Shell.Screenshot();
  await new Promise<void>((resolve, reject) => {
    if (area) {
      const {x, y, width, height} = area;
      screenshot.screenshot_area(x, y, width, height, stream,
        (_source, result) => finish(() => screenshot.screenshot_area_finish(result), resolve, reject));
    } else {
      screenshot.screenshot(false, stream, (_source, result) => finish(() => screenshot.screenshot_finish(result), resolve, reject));
    }
  });
  stream.close(null);
}

export async function capture(name: string) {
  await settled(CAPTURE_SETTLE);
  await shoot(Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null));
}

export async function screenshot(area: Area | null = null) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  await shoot(stream, area);
  return stream.steal_as_bytes();
}

export class Frame {
  readonly bytes: GLib.Bytes;
  private readonly _pixbuf: GdkPixbuf.Pixbuf;
  private readonly _pixels: Uint8Array;

  constructor(bytes: GLib.Bytes) {
    this.bytes = bytes;
    this._pixbuf = GdkPixbuf.Pixbuf.new_from_stream(Gio.MemoryInputStream.new_from_bytes(bytes), null);
    this._pixels = this._pixbuf.get_pixels();
  }

  get pixbuf() {
    return this._pixbuf;
  }

  count(colors: string[], tolerance: number) {
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

  share(colors: string[], tolerance: number) {
    const samples = Math.ceil(this._pixbuf.get_width() / SAMPLE_STEP) * Math.ceil(this._pixbuf.get_height() / SAMPLE_STEP);
    return this.count(colors, tolerance) / samples;
  }

  near(x: number, y: number, color: string, tolerance: number) {
    const offset = y * this._pixbuf.get_rowstride() + x * this._pixbuf.get_n_channels();
    return channels(color).every((value, channel) => Math.abs(this._pixels[offset + channel] - value) <= tolerance);
  }

  same(other: Frame | null) {
    return other?.bytes.compare(this.bytes) === 0;
  }

  looksLike(other: Frame, tolerance = 0) {
    return this._pixels.length === other._pixels.length && this._pixels.every((value, index) => Math.abs(value - other._pixels[index]) <= tolerance);
  }

  pixelsApart(other: Frame, tolerance: number) {
    const [width, height, stride, size] = [this._pixbuf.get_width(), this._pixbuf.get_height(), this._pixbuf.get_rowstride(), this._pixbuf.get_n_channels()];
    const [a, b] = [this._pixels, other._pixels];
    let count = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = y * stride + x * size;
        if ([0, 1, 2].some(channel => Math.abs(a[offset + channel] - b[offset + channel]) > tolerance)) count++;
      }
    }
    return count;
  }

  differences(other: Frame): {count: number; box: Box} {
    const [width, height, stride, size] = [this._pixbuf.get_width(), this._pixbuf.get_height(), this._pixbuf.get_rowstride(), this._pixbuf.get_n_channels()];
    const [a, b] = [this._pixels, other._pixels];
    const box = {x1: width, y1: height, x2: 0, y2: 0};
    let count = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = y * stride + x * size;
        if (a[offset] === b[offset] && a[offset + 1] === b[offset + 1] && a[offset + 2] === b[offset + 2]) continue;
        count++;
        box.x1 = Math.min(box.x1, x);
        box.y1 = Math.min(box.y1, y);
        box.x2 = Math.max(box.x2, x + 1);
        box.y2 = Math.max(box.y2, y + 1);
      }
    }
    return {count, box};
  }

  save(name: string) {
    GLib.file_set_contents(output(name), this.bytes.toArray());
  }

  saveZoomed(name: string, factor: number) {
    this._pixbuf.scale_simple(this._pixbuf.get_width() * factor, this._pixbuf.get_height() * factor, GdkPixbuf.InterpType.NEAREST)!
      .savev(output(name), 'png', [], []);
  }
}

export async function captureFrame(area: Area | null = null) {
  return new Frame(await screenshot(area));
}

function primaryView(view: Clutter.StageView) {
  const monitor = global.display.get_monitor_geometry(global.display.get_primary_monitor());
  return view.layout.x === monitor.x && view.layout.y === monitor.y;
}

function compositeTo(stream: Gio.OutputStream, texture: Cogl.Texture, {x, y, width, height}: Area) {
  return new Promise<void>((resolve, reject) => Shell.Screenshot.composite_to_stream(texture, x, y, width, height,
    1, null, 0, 0, 1, stream, (_source, result) => {
      try {
        Shell.Screenshot.composite_to_stream_finish(result);
        resolve();
      } catch (error) {
        reject(error);
      }
    })).finally(() => stream.close(null));
}

class ViewCopy {
  readonly texture: Cogl.Texture2D;
  private readonly _offscreen: Cogl.Offscreen;

  constructor(view: Clutter.StageView) {
    const framebuffer = view.get_framebuffer();
    this.texture = Cogl.Texture2D.new_with_size(framebuffer.get_context(), framebuffer.get_width(), framebuffer.get_height());
    this._offscreen = Cogl.Offscreen.new_with_texture(this.texture);
    this.copy(view);
  }

  copy(view: Clutter.StageView) {
    view.get_framebuffer().blit(this._offscreen, 0, 0, 0, 0, this.texture.get_width(), this.texture.get_height());
  }

  get whole(): Area {
    return {x: 0, y: 0, width: this.texture.get_width(), height: this.texture.get_height()};
  }
}

export async function captureRenderedFrames(name: string, action: () => Promise<void>) {
  const recording: {snapshot: ViewCopy | null} = {snapshot: null};
  const signal = global.stage.connect('after-paint', (_stage, view) => {
    if (!primaryView(view)) return;
    if (recording.snapshot) recording.snapshot.copy(view);
    else recording.snapshot = new ViewCopy(view);
  });
  try {
    await action();
  } finally {
    global.stage.disconnect(signal);
  }
  const {snapshot} = recording;
  if (!snapshot) throw new Error('No frame was rendered during capture');
  await compositeTo(Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null), snapshot.texture, snapshot.whole);
}

export async function renderedFrame(area: Area) {
  const [view, snapshot] = await new Promise<[Clutter.StageView, ViewCopy]>(resolve => {
    const signal = global.stage.connect('after-paint', (_stage, painted) => {
      if (!primaryView(painted)) return;
      global.stage.disconnect(signal);
      resolve([painted, new ViewCopy(painted)]);
    });
    global.stage.queue_redraw();
  });
  const scale = view.get_scale();
  const toPixels = (value: number) => Math.round(value * scale + 1e-6);
  const stream = Gio.MemoryOutputStream.new_resizable();
  await compositeTo(stream, snapshot.texture, {
    x: toPixels(area.x - view.layout.x),
    y: toPixels(area.y - view.layout.y),
    width: toPixels(area.width),
    height: toPixels(area.height),
  });
  return new Frame(stream.steal_as_bytes());
}

async function frameOf(snapshot: ViewCopy) {
  const stream = Gio.MemoryOutputStream.new_resizable();
  await compositeTo(stream, snapshot.texture, snapshot.whole);
  return new Frame(stream.steal_as_bytes());
}

export async function shownAndRepainted() {
  const view = global.stage.peek_stage_views().find(primaryView)!;
  const shown = new ViewCopy(view);
  const repainted = await new Promise<ViewCopy>(resolve => {
    const signal = global.stage.connect('after-paint', (_stage, painted) => {
      if (painted !== view) return;
      global.stage.disconnect(signal);
      resolve(new ViewCopy(painted));
    });
    global.stage.queue_redraw();
  });
  return [await frameOf(shown), await frameOf(repainted)];
}

export async function captureArea(name: string, area: Area) {
  await settled(CAPTURE_SETTLE);
  await shoot(Gio.File.new_for_path(pathFor(name)).replace(null, false, Gio.FileCreateFlags.NONE, null), area);
}
