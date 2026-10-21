import type Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import type { IconApp } from '../../appearance/icons/appIcons.js';
import type { MenuEntry } from '../../desktop/menus/contextMenus.js';
import type { Thumbnail } from '../clipboard/thumbnail.js';

export type Preview =
  | { kind: 'window'; window: Meta.Window }
  | { kind: 'glyph'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'image'; thumbnail: Thumbnail }
  | { kind: 'answer' };

export interface SearchItem {
  key: string;
  title: string;
  description: string;
  icon: Gio.Icon | IconApp;
  glyph?: string;
  preview?: Preview;
  activate(): void;
  reveal?(): void;
  menu?(): MenuEntry[];
}

export interface Ranked {
  item: SearchItem;
  score: number;
}

export type GroupId = 'apps' | 'commands' | 'windows' | 'actions' | 'settings' | 'clipboard' | 'emoji' | 'files' | 'contents' | 'web';

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
