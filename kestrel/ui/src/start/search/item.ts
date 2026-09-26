import type Gio from 'gi://Gio';
import type { MenuEntry } from '../../contextMenus.js';

export interface SearchItem {
  key: string;
  title: string;
  description: string;
  icon: Gio.Icon;
  activate(): void;
  menu?(): MenuEntry[];
}
