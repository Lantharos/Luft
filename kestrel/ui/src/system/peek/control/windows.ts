import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import { formatsLocale, t } from '../../../shared/i18n/index.js';
import type { Level } from '../access/grants.js';
import { PeekError } from '../errors.js';
import { captureArea } from './family.js';

const LISTED = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG, Meta.WindowType.UTILITY];

function listed(window: Meta.Window | null): window is Meta.Window {
  return !!window && !window.is_override_redirect() && LISTED.includes(window.get_window_type());
}

export function listedWindows(): Meta.Window[] {
  const windows = global.get_window_actors().map(actor => actor.meta_window).filter(listed);
  return global.display.sort_windows_by_stacking(windows).reverse();
}

export function windowById(id: number): Meta.Window {
  const window = listedWindows().find(candidate => candidate.get_id() === id);
  if (!window) throw new PeekError('NotFound', t('peek-error-no-window-id', { id: String(id) }));
  return window;
}

function appId(window: Meta.Window): string {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return app?.get_id()?.replace(/\.desktop$/, '') ?? window.get_sandboxed_app_id() ?? window.get_wm_class() ?? '';
}

export function describe(window: Meta.Window, level: Level | null, handle: string): Record<string, GLib.Variant> {
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
    handle: new GLib.Variant('s', handle),
  };
}

function painted(): Promise<void> {
  const stage = global.stage;
  return new Promise(resolve => {
    const id = stage.connect_after('after-paint', () => {
      stage.disconnect(id);
      resolve();
    });
    stage.queue_redraw();
  });
}

export function waitForWindow(ended: Set<() => void>, owned: (window: Meta.Window) => boolean, timeout: number): Promise<Meta.Window> {
  const existing = listedWindows().find(owned);
  if (existing) return Promise.resolve(existing);
  const display = global.display;
  const shown: [Meta.Window, number][] = [];
  let created = 0;
  let timer = 0;
  let quit = () => {};
  const finish = () => {
    display.disconnect(created);
    for (const [window, id] of shown) window.disconnect(id);
    if (timer) GLib.source_remove(timer);
    ended.delete(quit);
  };
  return new Promise<Meta.Window>((resolve, reject) => {
    created = display.connect('window-created', (_display, window: Meta.Window) => {
      shown.push([window, window.connect('shown', () => {
        if (!listed(window) || !owned(window)) return;
        finish();
        resolve(window);
      })]);
    });
    quit = () => {
      finish();
      reject(new PeekError('Failed', t('peek-error-ended-before-window')));
    };
    ended.add(quit);
    timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeout, () => {
      timer = 0;
      finish();
      reject(new PeekError('TimedOut', t('peek-error-no-window-in-time', { duration: new Intl.NumberFormat(formatsLocale(), { style: 'unit', unit: 'second' }).format(timeout / 1000) })));
      return GLib.SOURCE_REMOVE;
    });
  }).then(async window => {
    await painted();
    return window;
  });
}
