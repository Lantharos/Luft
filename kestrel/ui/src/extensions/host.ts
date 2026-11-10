import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import type { Keybindings } from '../context.js';
import type { ContextMenus } from '../desktop/menus/contextMenus.js';
import type { Monitor } from '../desktop/panel/panel.js';
import type { IslandShape } from '../desktop/panel/islands/shapes.js';
import type { EffectSurface, Rect } from './api/v1/types.js';

export class DesktopState {
  private listeners = new Set<() => void>();
  wallpaperShown = false;
  active = false;
  locked = false;

  update(wallpaperShown: boolean, active: boolean, locked: boolean): void {
    this.wallpaperShown = wallpaperShown;
    this.active = active;
    this.locked = locked;
    for (const listener of [...this.listeners]) listener();
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }
}

export interface SurfaceAnchor {
  actor: Clutter.Actor;
  radius?: number;
}

export interface DesktopPicture {
  actor: Clutter.Actor;
  fillsView?: boolean;
  underWindows?: boolean;
}

export interface ExtensionHost {
  readonly desktop: DesktopState;
  readonly menus: ContextMenus;
  readonly keybindings: Keybindings;
  readonly wallpaper: Clutter.Actor;
  readonly desktopLayer: Clutter.Actor;
  monitors(): Monitor[];
  primaryIndex(): number;
  monitorAt(x: number, y: number): Monitor | null;
  workArea(index: number): Rect;
  taskbar(monitor: Monitor): Rect | null;
  taskbarIslands(monitor: Monitor): IslandShape[];
  windowPicture(actor: Meta.WindowActor): Clutter.Actor | null;
  surfaceAnchors(surface: EffectSurface): SurfaceAnchor[];
  watchSurfaceAnchors(changed: () => void): () => void;
  desktopPictures(): DesktopPicture[];
  watchDesktopPictures(changed: () => void): () => void;
  holdTaskbarBlur(held: boolean): void;
  accent(): string;
  wallpaperAccent(): string;
  watchAccent(changed: () => void): () => void;
  colors(dark: boolean): Record<string, string>;
  watchPalette(changed: () => void): () => void;
  watchMonitors(changed: () => void): () => void;
  addPopup(actor: Clutter.Actor): void;
  removePopup(actor: Clutter.Actor): void;
  dismissSurfaces(): void;
  bindDesktopMenu(actor: Clutter.Actor): void;
  showNotifications(): void;
  type(text: string): void;
}
