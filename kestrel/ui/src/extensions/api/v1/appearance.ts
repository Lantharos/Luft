import Gio from 'gi://Gio';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { isDark, watchScheme } from '../../../shared/display/scheme.js';
import { reducedMotion } from '../../../shared/motion/motion.js';
import type { ApiContext } from './context.js';
import type { Appearance } from './types.js';

const INTERFACE_KEYS = ['font-name', 'text-scaling-factor'];
const stillMotion = () => reducedMotion() || !St.Settings.get().enable_animations;

function watchMotion(changed: () => void): () => void {
  const settings = St.Settings.get();
  const ids = [settings.connect('notify::enable-animations', changed), settings.connect('notify::reduced-motion', changed)];
  return () => ids.forEach(id => settings.disconnect(id));
}

function watchKeys(settings: Gio.Settings, keys: string[], changed: () => void): () => void {
  const ids = keys.map(key => settings.connect(`changed::${key}`, changed));
  return () => ids.forEach(id => settings.disconnect(id));
}

export function appearanceApi({ host, scope }: ApiContext): Appearance {
  const desktop = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  const kestrel = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
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
    get colors() {
      return host.colors(isDark());
    },
    get font() {
      return Pango.FontDescription.from_string(desktop.get_string('font-name')).get_family() ?? '';
    },
    get textScale() {
      return desktop.get_double('text-scaling-factor');
    },
    get squareCorners() {
      return !kestrel.get_boolean('rounded-window-corners');
    },
    get reducedMotion() {
      return stillMotion();
    },
    onChanged: changed => {
      const guarded = scope.guard(changed);
      const stops = [
        host.watchAccent(guarded),
        host.watchPalette(guarded),
        watchScheme(() => guarded()),
        watchMotion(guarded),
        watchKeys(desktop, INTERFACE_KEYS, guarded),
        watchKeys(kestrel, ['rounded-window-corners'], guarded),
      ];
      return scope.disposable(() => stops.forEach(stop => stop()));
    },
  };
}
