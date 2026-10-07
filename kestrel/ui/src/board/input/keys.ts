import type Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../../context.js';

const DOUBLE_TAP_TIME = 250;
const ZOOM_FACTOR = 1.25;
const STEP_BINDINGS: [string, number, number][] = [
  ['toggle-tiled-left', -1, 0],
  ['toggle-tiled-right', 1, 0],
  ['maximize', 0, -1],
  ['unmaximize', 0, 1],
];
const OVERVIEW_BINDING = 'restore-shortcuts';

type InhibitingWindow = Meta.Window & {
  shortcuts_inhibited(source: Clutter.InputDevice): boolean;
  force_restore_shortcuts(source: Clutter.InputDevice): void;
};

interface KeyActions {
  readonly shown: boolean;
  step(directionX: number, directionY: number): void;
  zoomStep(factor: number): void;
  enterFocused(): void;
  overview(): void;
}

export class BoardKeys {
  private lastTap = -Infinity;
  private engaged = false;

  constructor(keybindings: Keybindings, private readonly actions: KeyActions) {
    const settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' });
    for (const [name, factor] of [['board-zoom-in', ZOOM_FACTOR], ['board-zoom-out', 1 / ZOOM_FACTOR]] as const) {
      keybindings.add(name, settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, () => {
        if (this.actions.shown) this.actions.zoomStep(factor);
      });
    }
    keybindings.add('board-enter-window', settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, () => {
      if (this.actions.shown) this.actions.enterFocused();
    });
  }

  doubleTapped(): boolean {
    const now = GLib.get_monotonic_time() / 1000;
    const tapped = now - this.lastTap < DOUBLE_TAP_TIME;
    this.lastTap = tapped ? -Infinity : now;
    return tapped;
  }

  engage(): void {
    if (this.engaged) return;
    this.engaged = true;
    for (const [name, directionX, directionY] of STEP_BINDINGS)
      Meta.keybindings_set_custom_handler(name, () => this.actions.step(directionX, directionY));
    Meta.keybindings_set_custom_handler(OVERVIEW_BINDING, (display, _window, event) => {
      const focused = display.focus_window as InhibitingWindow | null;
      const source = event.get_source_device();
      if (focused?.shortcuts_inhibited(source)) focused.force_restore_shortcuts(source);
      else this.actions.overview();
    });
  }

  release(): void {
    if (!this.engaged) return;
    this.engaged = false;
    for (const [name] of STEP_BINDINGS) Meta.keybindings_set_custom_handler(name, null);
    Meta.keybindings_set_custom_handler(OVERVIEW_BINDING, null);
  }

  destroy(): void {
    this.release();
  }
}
