import Gio from 'gi://Gio';

import { confinedFile } from '../core/confined.js';
import type { Icon } from '../types.js';

export function resolveIcon(folder: string, icon: Icon): Gio.Icon {
  if (!icon.includes('/') && !icon.endsWith('.svg')) return new Gio.ThemedIcon({ name: icon });
  return new Gio.FileIcon({ file: confinedFile([folder], icon) });
}
