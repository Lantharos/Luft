import type Clutter from 'gi://Clutter';

import type { Keybindings } from '../context.js';
import type { ContextMenus } from '../desktop/menus/contextMenus.js';
import type { Monitor } from '../desktop/panel/panel.js';
import type { Rect } from './api/v1/types.js';

/** What the desktop is doing, as far as extensions care. It tells its listeners whenever windows or surfaces may have moved. */
export class DesktopState {
  private listeners = new Set<() => void>();
  wallpaperShown = false;
  active = false;

  update(wallpaperShown: boolean, active: boolean): void {
    this.wallpaperShown = wallpaperShown;
    this.active = active;
    for (const listener of [...this.listeners]) listener();
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }
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
  accent(): string;
  wallpaperAccent(): string;
  watchAccent(changed: () => void): () => void;
  watchMonitors(changed: () => void): () => void;
  /** Puts a pop-up above everything but the screen keyboard, or takes it away. */
  addPopup(actor: Clutter.Actor): void;
  removePopup(actor: Clutter.Actor): void;
  /** Closes Kestrel's own surfaces and menus, before a panel opens. */
  dismissSurfaces(): void;
  /** Types text into what has the keyboard, or pastes it where nothing takes typed text. */
  type(text: string): void;
}
