import Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';
import St from 'gi://St';

import type { TileGrid } from './tileGrid.js';

interface Press { tile: St.Button; x: number; y: number }
interface Drag { tile: St.Button; offsetX: number; offsetY: number; grab: Clutter.Grab }


export class TileDrag {
  private press: Press | null = null;
  private drag: Drag | null = null;

  constructor(private readonly grid: TileGrid, private readonly dropped: () => void) {}

  attach(tile: St.Button): void {
    tile.connect('captured-event', (_actor, event: Clutter.Event) => this.handle(tile, event));
  }

  private handle(tile: St.Button, event: Clutter.Event): boolean {
    const [x, y] = event.get_coords();
    switch (event.type()) {
      case Clutter.EventType.BUTTON_PRESS:
        this.press = event.get_button() === Clutter.BUTTON_PRIMARY ? { tile, x, y } : null;
        return Clutter.EVENT_PROPAGATE;
      case Clutter.EventType.MOTION:
        if (this.drag?.tile === tile) {
          this.move(x, y);
          return Clutter.EVENT_STOP;
        }
        if (this.press?.tile === tile && event.get_state() & Clutter.ModifierType.BUTTON1_MASK &&
            Math.hypot(x - this.press.x, y - this.press.y) > St.Settings.get().drag_threshold) {
          this.begin(tile);
          this.move(x, y);
          return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
      case Clutter.EventType.BUTTON_RELEASE:
        this.press = null;
        if (this.drag?.tile !== tile) return Clutter.EVENT_PROPAGATE;
        this.end();
        return Clutter.EVENT_STOP;
      default:
        return Clutter.EVENT_PROPAGATE;
    }
  }

  private begin(tile: St.Button): void {
    const [gridX, gridY] = this.grid.actor.get_transformed_position();
    const { x, y } = this.press!;
    tile.fake_release();
    this.drag = {
      tile, offsetX: x - gridX - tile.x, offsetY: y - gridY - tile.y,
      grab: (global as unknown as Shell.Global).stage.grab(tile),
    };
    this.grid.hold(tile);
    tile.add_style_class_name('kestrel-control-lifted');
  }

  private move(x: number, y: number): void {
    const { tile, offsetX, offsetY } = this.drag!;
    const [gridX, gridY] = this.grid.actor.get_transformed_position();
    tile.remove_transition('x');
    tile.remove_transition('y');
    tile.set_position(Math.round(x - gridX - offsetX), Math.round(y - gridY - offsetY));
    this.grid.dragTo(tile, tile.x + tile.width / 2, tile.y + tile.height / 2);
  }

  private end(): void {
    const { tile, grab } = this.drag!;
    this.drag = null;
    grab.dismiss();
    tile.remove_style_class_name('kestrel-control-lifted');
    this.grid.release();
    this.dropped();
  }
}
