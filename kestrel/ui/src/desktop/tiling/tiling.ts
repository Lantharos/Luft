import type Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import type { Keybindings } from '../../context.js';
import type { Box } from '../../shared/placement.js';
import { TilingCommands } from './commands.js';
import { TilingDrag } from './drag.js';
import { TilingKeys } from './keys.js';
import { contains } from './layouts/geometry.js';
import type { TilingMode } from './preferences.js';
import { StripOverview } from './scrolling/overview.js';
import { ScrollingSpace } from './scrolling/scrollingSpace.js';
import { StripSwipe } from './scrolling/swipe.js';
import { Tiler } from './tiler.js';

export interface TilingContext {
  monitors(): Box[];
  primaryIndex(): number;
  workArea(monitor: number): Box;
  morph(window: Meta.Window): void;
  activate(window: Meta.Window): void;
  keybindings: Keybindings;
  board: { readonly shown: boolean; step(directionX: number, directionY: number): void };
  addChrome(actor: Clutter.Actor): void;
  removeChrome(actor: Clutter.Actor): void;
  canInteract(): boolean;
}

export class Tiling {
  private readonly tiler: Tiler;
  private readonly commands: TilingCommands;
  private readonly keys: TilingKeys;
  private readonly drag: TilingDrag;
  private readonly swipe: StripSwipe;
  private readonly overview: StripOverview;
  private readonly unwatch: () => void;

  constructor(private readonly context: TilingContext) {
    const monitors = () => context.monitors();
    const boardShown = () => context.board.shown;
    this.tiler = new Tiler({ monitors, primaryIndex: context.primaryIndex, workArea: context.workArea, morph: context.morph, boardShown });
    this.commands = new TilingCommands(this.tiler, {
      monitors, activate: context.activate, boardShown,
      boardStep: (directionX, directionY) => context.board.step(directionX, directionY),
    });
    this.overview = new StripOverview({
      monitorBox: monitor => monitors()[monitor]!,
      addChrome: context.addChrome, removeChrome: context.removeChrome, activate: context.activate,
    });
    this.keys = new TilingKeys(context.keybindings, this.commands, () => this.overview.toggle(this.commands.focusedStrip()));
    this.drag = new TilingDrag(this.tiler, monitors);
    this.swipe = new StripSwipe(
      () => this.tiler.mode === 'scrolling' && context.canInteract() && !context.board.shown,
      (x, y) => this.stripAt(x, y),
      context.activate,
    );
    this.unwatch = this.tiler.watchMode(mode => this.modeChanged(mode));
  }

  get mode(): TilingMode {
    return this.tiler.mode;
  }

  touchpad(event: Clutter.Event): boolean {
    return this.swipe.handle(event);
  }

  syncBoard(): void {
    this.tiler.syncBoard();
  }

  monitorsChanged(): void {
    this.overview.close();
    this.tiler.monitorsChanged();
  }

  destroy(): void {
    this.overview.close();
    this.unwatch();
    this.keys.release();
    this.drag.engage(false);
    this.tiler.destroy();
  }

  private modeChanged(mode: TilingMode): void {
    this.overview.close();
    this.keys.engage(mode);
    this.drag.engage(mode !== 'off');
  }

  private stripAt(x: number, y: number): ScrollingSpace | null {
    const monitor = this.context.monitors().findIndex(box => contains(box, x, y));
    const space = monitor < 0 ? null : this.tiler.spaceOn(monitor);
    return space instanceof ScrollingSpace ? space : null;
  }
}
