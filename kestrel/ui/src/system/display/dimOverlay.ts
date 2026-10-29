import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import type Meta from 'gi://Meta';

import * as Layout from '../../core/stage/layout.js';
import * as Main from '../../core/main.js';
import { dimTransition, perceived } from './dimming.js';

const BLACK = new Cogl.Color({ red: 0, green: 0, blue: 0, alpha: 255 });

export class DimOverlay {
  private readonly actor = new Clutter.Actor({ name: 'dimOverlay', opacity: 0, visible: false });
  private readonly depth: number;
  private dimmed = false;

  constructor(dimmingTarget: number) {
    this.depth = Math.round(255 * (1 - perceived(dimmingTarget)));
    Main.uiGroup.add_child(this.actor);
  }

  cover(monitors: Meta.LogicalMonitor[]): void {
    this.actor.destroy_all_children();
    for (const monitor of monitors) {
      const cover = new Clutter.Actor({ background_color: BLACK });
      cover.add_constraint(new Layout.MonitorConstraint({ index: monitor.get_number() }));
      this.actor.add_child(cover);
    }
    this.update();
  }

  dim(dimmed: boolean): void {
    if (dimmed === this.dimmed) return;
    this.dimmed = dimmed;
    this.update();
  }

  private update(): void {
    const shown = this.dimmed && this.actor.get_n_children() > 0;
    if (!shown && !this.actor.visible) return;

    if (shown && !this.actor.visible) {
      global.compositor.disable_unredirect();
      this.actor.show();
    }
    if (shown) Main.uiGroup.set_child_above_sibling(this.actor, null);

    const { duration, curve } = dimTransition(shown);
    this.actor.ease({
      opacity: shown ? this.depth : 0,
      duration,
      curve,
      animationRequired: true,
      onComplete: () => {
        if (shown) return;
        this.actor.hide();
        global.compositor.enable_unredirect();
      },
    });
  }
}
