import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../context.js';

const DOUBLE_TAP_TIME = 250;
const ZOOM_FACTOR = 1.25;
const PAN_BINDINGS: [string, number, number][] = [
  ['toggle-tiled-left', -1, 0],
  ['toggle-tiled-right', 1, 0],
  ['maximize', 0, -1],
  ['unmaximize', 0, 1],
];

interface KeyActions {
  readonly shown: boolean;
  panStep(directionX: number, directionY: number): void;
  zoomStep(factor: number): void;
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
    for (const [name, directionX, directionY] of PAN_BINDINGS)
      Meta.keybindings_set_custom_handler(name, () => this.actions.panStep(directionX, directionY));
  }

  release(): void {
    if (!this.engaged) return;
    this.engaged = false;
    for (const [name] of PAN_BINDINGS) Meta.keybindings_set_custom_handler(name, null);
  }

  destroy(): void {
    this.release();
  }
}
