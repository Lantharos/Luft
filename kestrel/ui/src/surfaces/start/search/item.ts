import type Gio from 'gi://Gio';
import type { IconApp } from '../../../appearance/icons/appIcons.js';
import type { MenuEntry } from '../../../desktop/menus/contextMenus.js';

export interface SearchItem {
  key: string;
  title: string;
  description: string;
  icon: Gio.Icon | IconApp;
  activate(): void;
  reveal?(): void;
  menu?(): MenuEntry[];
}

export interface Ranked {
  item: SearchItem;
  score: number;
}

export type GroupId = 'apps' | 'actions' | 'settings' | 'files' | 'contents';

export interface SearchGroup {
  title: string;
  items: SearchItem[];
}

export interface SearchView {
  best: SearchItem | null;
  groups: SearchGroup[];
  pending: boolean;
  fresh: boolean;
}
