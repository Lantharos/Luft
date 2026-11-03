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
  monitors(): Monitor[];
  taskbar(monitor: Monitor): Rect | null;
  accent(): string;
  watchAccent(changed: () => void): () => void;
  watchMonitors(changed: () => void): () => void;
}
