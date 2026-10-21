import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import type { Keybindings } from '../../context.js';
import type { TilingCommands } from './commands.js';
import { DIRECTIONS } from './layouts/geometry.js';
import type { TilingMode } from './preferences.js';

type Bindings = [name: string, run: () => void][];

export class TilingKeys {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' });
  private registered: string[] = [];

  constructor(private readonly keybindings: Keybindings, private readonly commands: TilingCommands, private readonly toggleOverview: () => void) {}

  engage(mode: TilingMode): void {
    this.release();
    if (mode === 'off') return;
    const bindings: Bindings = [
      ...DIRECTIONS.flatMap((direction): Bindings => [
        [`tiling-focus-${direction}`, () => this.commands.focus(direction)],
        [`tiling-move-${direction}`, () => this.commands.move(direction)],
        [`tiling-resize-${direction}`, () => this.commands.resize(direction)],
      ]),
      ['tiling-toggle-floating', () => this.commands.toggleFloating()],
    ];
    if (mode === 'scrolling') {
      bindings.push(
        ['tiling-cycle-width', () => this.commands.cycleWidth()],
        ['tiling-center-column', () => this.commands.center()],
        ['tiling-overview', this.toggleOverview],
        ['tiling-stack-left', () => this.commands.stack(-1)],
        ['tiling-stack-right', () => this.commands.stack(1)],
      );
    }
    for (const [name, run] of bindings) {
      this.keybindings.add(name, this.settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.NORMAL, run);
      this.registered.push(name);
    }
  }

  release(): void {
    for (const name of this.registered) this.keybindings.remove(name);
    this.registered = [];
  }
}
