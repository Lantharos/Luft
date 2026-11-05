import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import type { Keybindings } from '../context.js';
import type { ContextMenus } from '../desktop/menus/contextMenus.js';
import type { Monitor } from '../desktop/panel/panel.js';
import type { IslandShape } from '../desktop/panel/islands/shapes.js';
import type { EffectSurface, Rect } from './api/v1/types.js';

/** What the desktop is doing, as far as extensions care. It tells its listeners whenever windows or surfaces may have moved. */
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

/** One of Kestrel's surfaces as an actor. */
export interface SurfaceAnchor {
  actor: Clutter.Actor;
  /** The rounding of its corners, when its style doesn't say. */
  radius?: number;
}

/** The pieces of Kestrel the extension API stands on. Extensions only ever see the API built over them. */
export interface ExtensionHost {
  readonly desktop: DesktopState;
  readonly menus: ContextMenus;
  readonly keybindings: Keybindings;
  /** The wallpaper, at the bottom of the window group. */
  readonly wallpaper: Clutter.Actor;
  monitors(): Monitor[];
  primaryIndex(): number;
  monitorAt(x: number, y: number): Monitor | null;
  /** Where windows go on a display, without the taskbar. */
  workArea(index: number): Rect;
  taskbar(monitor: Monitor): Rect | null;
  /** Each part of the taskbar on a display as people see it, in stage coordinates: the bar, or every separate island with its edge and rounding. */
  taskbarIslands(monitor: Monitor): IslandShape[];
  /** What shows in place of a window that's hidden while it changes size, if it is. */
  windowPicture(actor: Meta.WindowActor): Clutter.Actor | null;
  /** The actors that make up one of Kestrel's surfaces right now. */
  surfaceAnchors(surface: EffectSurface): SurfaceAnchor[];
  watchSurfaceAnchors(changed: () => void): () => void;
  accent(): string;
  wallpaperAccent(): string;
  watchAccent(changed: () => void): () => void;
  colors(dark: boolean): Record<string, string>;
  watchPalette(changed: () => void): () => void;
  watchMonitors(changed: () => void): () => void;
  /** Puts a pop-up above everything but the screen keyboard, or takes it away. */
  addPopup(actor: Clutter.Actor): void;
  removePopup(actor: Clutter.Actor): void;
  /** Closes Kestrel's own surfaces and menus, before a panel opens. */
  dismissSurfaces(): void;
  /** Gives an actor on the desktop the desktop's own right-click menu. */
  bindDesktopMenu(actor: Clutter.Actor): void;
  /** Opens the notification center. */
  showNotifications(): void;
  /** Types text into what has the keyboard, or pastes it where nothing takes typed text. */
  type(text: string): void;
}
