import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Level } from '../access/grants.js';
import type { Launch } from '../access/launches.js';
import { LookError } from '../errors.js';

const LISTED = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];

const shell = () => global as unknown as Shell.Global;

export interface CaptureArea {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
}

function listed(window: Meta.Window | null): window is Meta.Window {
  return !!window && !window.is_override_redirect() && LISTED.includes(window.get_window_type());
}

export function listedWindows(): Meta.Window[] {
  const windows = shell().get_window_actors().map(actor => actor.meta_window).filter(listed);
  return shell().display.sort_windows_by_stacking(windows).reverse();
}

export function windowById(id: number): Meta.Window {
  const window = listedWindows().find(candidate => candidate.get_id() === id);
  if (!window) throw new LookError('NotFound', `No window has the id ${id}. luft-look list shows the open ones.`);
  return window;
}

export function captureArea(window: Meta.Window): CaptureArea {
  const scale = (window.get_compositor_private() as Meta.WindowActor).get_resource_scale();
  const frame = window.get_frame_rect();
  const buffer = window.get_buffer_rect();
  return {
    x: Math.round((frame.x - buffer.x) * scale),
    y: Math.round((frame.y - buffer.y) * scale),
    width: Math.round(frame.width * scale),
    height: Math.round(frame.height * scale),
    scale,
  };
}

function appId(window: Meta.Window): string {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return app?.get_id()?.replace(/\.desktop$/, '') ?? window.get_sandboxed_app_id() ?? window.get_wm_class() ?? '';
}

export function describe(window: Meta.Window, level: Level | null, launched: boolean): Record<string, GLib.Variant> {
  const { width, height, scale } = captureArea(window);
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return {
    id: new GLib.Variant('t', window.get_id()),
    app: new GLib.Variant('s', appId(window)),
    name: new GLib.Variant('s', app?.get_name() ?? ''),
    title: new GLib.Variant('s', level ? window.get_title() ?? '' : ''),
    width: new GLib.Variant('u', width),
    height: new GLib.Variant('u', height),
    scale: new GLib.Variant('d', scale),
    focused: new GLib.Variant('b', window.has_focus()),
    access: new GLib.Variant('s', level ?? 'ask'),
    launched: new GLib.Variant('b', launched),
  };
}

function painted(): Promise<void> {
  const stage = shell().stage;
  return new Promise(resolve => {
    const id = stage.connect_after('after-paint', () => {
      stage.disconnect(id);
      resolve();
    });
    stage.queue_redraw();
  });
}

export function waitForWindow(launch: Launch, owned: (window: Meta.Window) => boolean, timeout: number): Promise<Meta.Window> {
  const existing = listedWindows().find(owned);
  if (existing) return Promise.resolve(existing);
  const display = shell().display;
  const shown: [Meta.Window, number][] = [];
  let created = 0;
  let timer = 0;
  let ended = () => {};
  const finish = () => {
    display.disconnect(created);
    for (const [window, id] of shown) window.disconnect(id);
    if (timer) GLib.source_remove(timer);
    launch.ended.delete(ended);
  };
  return new Promise<Meta.Window>((resolve, reject) => {
    created = display.connect('window-created', (_display, window: Meta.Window) => {
      shown.push([window, window.connect('shown', () => {
        if (!listed(window) || !owned(window)) return;
        finish();
        resolve(window);
      })]);
    });
    ended = () => {
      finish();
      reject(new LookError('Failed', 'The program ended before it opened a window'));
    };
    launch.ended.add(ended);
    timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
      timer = 0;
      finish();
      reject(new LookError('TimedOut', `No window opened within ${timeout / 1000} s`));
      return GLib.SOURCE_REMOVE;
    });
  }).then(async window => {
    await painted();
    return window;
  });
}
