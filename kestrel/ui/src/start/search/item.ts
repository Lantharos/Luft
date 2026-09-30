import type Gio from 'gi://Gio';
import type { IconApp } from '../../appearance/icons/appIcons.js';
import type { MenuEntry } from '../../menus/contextMenus.js';

export interface SearchItem {
  key: string;
  title: string;
  description: string;
  icon: Gio.Icon | IconApp;
  activate(): void;
  menu?(): MenuEntry[];
}
