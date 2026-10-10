import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { LookError } from '../errors.js';
import { captureArea } from './windows.js';

function settled<T>(start: (done: (result: Gio.AsyncResult) => void) => void, finish: (result: Gio.AsyncResult) => T): Promise<T> {
  return new Promise((resolve, reject) => start(result => {
    try {
      resolve(finish(result));
    } catch (error) {
      reject(error);
    }
  }));
}

export async function captureWindow(window: Meta.Window, output: Gio.OutputStream): Promise<void> {
  const actor = window.get_compositor_private() as Meta.WindowActor;
  const content = actor.paint_to_content(null) as Clutter.TextureContent | null;
  if (!content) throw new LookError('Failed', "The window isn't showing anything to capture");
  const { x, y, width, height, scale } = captureArea(window);
  await settled(done => Shell.Screenshot.composite_to_stream(content.get_texture(), x, y, width, height, scale, null, 0, 0, 1, output, (_source, result) => done(result)),
    result => Shell.Screenshot.composite_to_stream_finish(result));
}

export async function captureScreen(output: Gio.OutputStream): Promise<void> {
  const shooter = new Shell.Screenshot();
  await settled(done => shooter.screenshot(false, output, (_source, result) => done(result)), result => shooter.screenshot_finish(result));
}
