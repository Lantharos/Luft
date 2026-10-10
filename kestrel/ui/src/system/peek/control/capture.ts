import type Clutter from 'gi://Clutter';
import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { PeekError } from '../errors.js';
import { captureArea, family, scaleOf } from './family.js';

function settled<T>(start: (done: (result: Gio.AsyncResult) => void) => void, finish: (result: Gio.AsyncResult) => T): Promise<T> {
  return new Promise((resolve, reject) => start(result => {
    try {
      resolve(finish(result));
    } catch (error) {
      reject(error);
    }
  }));
}

async function shoot(window: Meta.Window, output: Gio.OutputStream): Promise<GdkPixbuf.Pixbuf | null> {
  const actor = window.get_compositor_private() as Meta.WindowActor;
  const content = actor.paint_to_content(null) as Clutter.TextureContent | null;
  if (!content) throw new PeekError('Failed', "The window isn't showing anything to capture");
  const scale = scaleOf(window);
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  return settled(done => Shell.Screenshot.composite_to_stream(content.get_texture(),
    Math.round((frame.x - buffer.x) * scale), Math.round((frame.y - buffer.y) * scale),
    Math.round(frame.width * scale), Math.round(frame.height * scale),
    scale, null, 0, 0, 1, output, (_source, result) => done(result)), result => Shell.Screenshot.composite_to_stream_finish(result));
}

export async function captureWindow(window: Meta.Window, output: Gio.OutputStream): Promise<void> {
  const windows = family(window);
  if (windows.length === 1) {
    await shoot(window, output);
    return;
  }
  const area = captureArea(window);
  const picture = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, true, 8, area.width, area.height)!;
  picture.fill(0);
  for (const member of windows) {
    const layer = (await shoot(member, Gio.MemoryOutputStream.new_resizable()))!;
    const frame = member.get_frame_rect();
    const x = Math.round((frame.x - area.x) * area.scale);
    const y = Math.round((frame.y - area.y) * area.scale);
    const width = Math.min(layer.get_width(), area.width - x);
    const height = Math.min(layer.get_height(), area.height - y);
    layer.composite(picture, x, y, width, height, x, y, 1, 1, GdkPixbuf.InterpType.NEAREST, 255);
  }
  picture.save_to_streamv(output, 'png', [], [], null);
}

export async function captureScreen(output: Gio.OutputStream): Promise<void> {
  const shooter = new Shell.Screenshot();
  await settled(done => shooter.screenshot(false, output, (_source, result) => done(result)), result => shooter.screenshot_finish(result));
}
