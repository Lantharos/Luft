import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Icon } from '../types.js';

export function resolveIcon(folder: string, icon: Icon): Gio.Icon {
  if (!icon.includes('/') && !icon.endsWith('.svg')) return new Gio.ThemedIcon({ name: icon });
  const file = Gio.File.new_for_path(GLib.build_filenamev([folder, icon]));
  if (!file.has_prefix(Gio.File.new_for_path(folder))) throw new Error(`${icon} is outside the extension`);
  return new Gio.FileIcon({ file });
}
