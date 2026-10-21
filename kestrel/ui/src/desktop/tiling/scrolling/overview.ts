import Clutter from 'gi://Clutter';
import type Meta from 'gi://Meta';

import type { Box } from '../../../shared/placement.js';
import type { ScrollingSpace } from './scrollingSpace.js';

export interface OverviewSurroundings {
  monitorBox(monitor: number): Box;
  addChrome(actor: Clutter.Actor): void;
  removeChrome(actor: Clutter.Actor): void;
  activate(window: Meta.Window): void;
}

export class StripOverview {
  private space: ScrollingSpace | null = null;
  private shield: Clutter.Actor | null = null;
  private returnTo: Meta.Window | null = null;

  constructor(private readonly surroundings: OverviewSurroundings) {}

  get open(): boolean {
    return this.space !== null;
  }

  toggle(space: ScrollingSpace | null): void {
    if (this.space) this.pick(null);
    else if (space?.windows.length) this.show(space);
  }

  close(): void {
    const space = this.space;
    if (!space) return;
    this.space = null;
    space.zoom(false);
    if (this.shield) {
      this.surroundings.removeChrome(this.shield);
      this.shield.destroy();
    }
    this.shield = null;
  }

  private pick(window: Meta.Window | null): void {
    this.close();
    const chosen = window ?? this.returnTo;
    this.returnTo = null;
    if (chosen) this.surroundings.activate(chosen);
  }

  private show(space: ScrollingSpace): void {
    this.space = space;
    const { x, y, width, height } = this.surroundings.monitorBox(space.monitor);
    const shield = new Clutter.Actor({ name: 'kestrel-strip-overview', reactive: true, x, y, width, height });
    shield.connect('button-release-event', (_actor, event: Clutter.Event) => {
      this.pick(space.windowAt(...event.get_coords()));
      return Clutter.EVENT_STOP;
    });
    shield.connect('key-press-event', (_actor, event: Clutter.Event) => {
      if (![Clutter.KEY_Escape, Clutter.KEY_Return, Clutter.KEY_KP_Enter].includes(event.get_key_symbol())) return Clutter.EVENT_PROPAGATE;
      this.pick(null);
      return Clutter.EVENT_STOP;
    });
    this.shield = shield;
    this.returnTo = global.display.focus_window;
    this.surroundings.addChrome(shield);
    shield.grab_key_focus();
    space.zoom(true);
  }
}
