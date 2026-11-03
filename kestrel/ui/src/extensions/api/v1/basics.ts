import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import { isDark, watchScheme } from '../../../shared/display/scheme.js';
import { reducedMotion } from '../../../shared/motion/motion.js';
import type { ApiContext } from './context.js';
import type { Appearance, Disposable, Session, Settings, Storage, Timers } from './types.js';

export function settingsApi({ values, scope }: ApiContext): Settings {
  return {
    get: key => values.get(key) as never,
    set: (key, value) => values.set(key, value),
    onChanged: changed => scope.disposable(values.watch(scope.guard(changed))),
  };
}

function timer(scope: ApiContext['scope'], milliseconds: number, callback: () => void, repeat: boolean): Disposable {
  let source = 0;
  const handle = scope.disposable(() => {
    if (source) GLib.source_remove(source);
  });
  source = GLib.timeout_add(GLib.PRIORITY_DEFAULT, Math.max(0, milliseconds), () => {
    scope.run(callback);
    if (repeat) return GLib.SOURCE_CONTINUE;
    source = 0;
    handle.dispose();
    return GLib.SOURCE_REMOVE;
  });
  return handle;
}

export function timersApi({ scope }: ApiContext): Timers {
  return {
    timeout: (milliseconds, callback) => timer(scope, milliseconds, callback, false),
    interval: (milliseconds, callback) => timer(scope, milliseconds, callback, true),
  };
}

export function sessionApi({ host, scope }: ApiContext): Session {
  return {
    get active() {
      return host.desktop.active;
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      let active = host.desktop.active;
      return scope.disposable(host.desktop.watch(() => {
        if (host.desktop.active === active) return;
        active = host.desktop.active;
        guarded();
      }));
    },
  };
}

const stillMotion = () => reducedMotion() || !St.Settings.get().enable_animations;

function watchMotion(changed: () => void): () => void {
  const settings = St.Settings.get();
  const ids = [settings.connect('notify::enable-animations', changed), settings.connect('notify::reduced-motion', changed)];
  return () => ids.forEach(id => settings.disconnect(id));
}

export function appearanceApi({ host, scope }: ApiContext): Appearance {
  return {
    get accent() {
      return host.accent();
    },
    get wallpaperAccent() {
      return host.wallpaperAccent();
    },
    get dark() {
      return isDark();
    },
    get reducedMotion() {
      return stillMotion();
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      const stops = [host.watchAccent(guarded), watchScheme(() => guarded()), watchMotion(guarded)];
      return scope.disposable(() => stops.forEach(stop => stop()));
    },
  };
}

export function storageApi({ stored }: ApiContext): Storage {
  return {
    get: key => stored.get(key) as never,
    set: (key, value) => stored.set(key, value),
    delete: key => stored.delete(key),
    keys: () => stored.keys(),
  };
}

export function open(uri: string): void {
  const scheme = GLib.uri_peek_scheme(uri);
  if (!scheme) throw new Error(`${uri} isn't a link or a file`);
  Gio.AppInfo.launch_default_for_uri_async(uri, global.create_app_launch_context(0, -1), null, null);
}
