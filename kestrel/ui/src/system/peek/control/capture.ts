import type Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { PeekError } from '../errors.js';
import { captureArea, family, scaleOf } from './family.js';

interface Snapshot {
  readonly texture: Cogl.Texture;
  readonly scale: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly left: number;
  readonly top: number;
  readonly whole: boolean;
}

function settled<T>(start: (done: (result: Gio.AsyncResult) => void) => void, finish: (result: Gio.AsyncResult) => T): Promise<T> {
  return new Promise((resolve, reject) => start(result => {
    try {
      resolve(finish(result));
    } catch (error) {
      reject(error);
    }
  }));
}

function snapshot(window: Meta.Window): Snapshot {
  const actor = window.get_compositor_private() as Meta.WindowActor;
  const content = actor.paint_to_content(null) as Clutter.TextureContent | null;
  if (!content) throw new PeekError('Failed', "The window isn't showing anything to capture");
  const texture = content.get_texture();
  const scale = scaleOf(window);
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  const left = Math.round((frame.x - buffer.x) * scale);
  const top = Math.round((frame.y - buffer.y) * scale);
  const right = left + Math.round(frame.width * scale);
  const bottom = top + Math.round(frame.height * scale);
  const x = Math.max(left, 0);
  const y = Math.max(top, 0);
  const width = Math.min(right, texture.get_width()) - x;
  const height = Math.min(bottom, texture.get_height()) - y;
  if (width <= 0 || height <= 0) throw new PeekError('Failed', "The window isn't showing anything to capture");
  const whole = x === left && y === top && width === right - left && height === bottom - top;
  return { texture, scale, x, y, width, height, left: x - left, top: y - top, whole };
}

function encode(shot: Snapshot, output: Gio.OutputStream): Promise<GdkPixbuf.Pixbuf | null> {
  return settled(done => Shell.Screenshot.composite_to_stream(shot.texture, shot.x, shot.y, shot.width, shot.height,
    shot.scale, null, 0, 0, 1, output, (_source, result) => done(result)), result => Shell.Screenshot.composite_to_stream_finish(result));
}

export async function captureWindow(window: Meta.Window, output: Gio.OutputStream): Promise<void> {
  const windows = family(window);
  const shots = windows.map(snapshot);
  if (windows.length === 1 && shots[0].whole) {
    await encode(shots[0], output);
    return;
  }
  const area = captureArea(window);
  const picture = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, area.width, area.height)!;
  picture.fill(0);
  for (const [index, member] of windows.entries()) {
    const shot = shots[index];
    const layer = (await encode(shot, Gio.MemoryOutputStream.new_resizable()))!;
    const frame = member.get_frame_rect();
    const x = Math.round((frame.x - area.x) * area.scale) + shot.left;
    const y = Math.round((frame.y - area.y) * area.scale) + shot.top;
    const width = Math.min(layer.get_width(), area.width - x);
    const height = Math.min(layer.get_height(), area.height - y);
    if (width > 0 && height > 0)
      layer.composite(picture, x, y, width, height, x, y, 1, 1, GdkPixbuf.InterpType.NEAREST, 255);
  }
  picture.save_to_streamv(output, 'png', [], [], null);
}

export async function captureScreen(output: Gio.OutputStream): Promise<void> {
  const shooter = new Shell.Screenshot();
  await settled(done => shooter.screenshot(false, output, (_source, result) => done(result)), result => shooter.screenshot_finish(result));
}
