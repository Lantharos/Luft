import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';

import { animateActor } from '../shared/motion.js';
import { BUS_NAME, FAREWELL_DURATION, MANAGER_PATH } from './manager/interfaces.js';

export class Blackout {
  private cover: Clutter.Actor | null = null;
  private pointerHidden = false;

  fade(): Promise<void> {
    this.lift();
    const stage = global.stage;
    const cover = this.cover = new Clutter.Actor({
      background_color: new Cogl.Color({ red: 0, green: 0, blue: 0, alpha: 255 }),
      opacity: 0,
      reactive: true,
      constraints: new Clutter.BindConstraint({ source: stage, coordinate: Clutter.BindCoordinate.ALL }),
    });
    stage.add_child(cover);
    return new Promise(resolve => animateActor(cover, {
      opacity: 255,
      duration: FAREWELL_DURATION,
      mode: Clutter.AnimationMode.EASE_IN_QUAD,
      onComplete: () => {
        this.hidePointer();
        resolve();
      },
    }));
  }

  lift(): void {
    this.cover?.destroy();
    this.cover = null;
    if (!this.pointerHidden) return;
    this.pointerHidden = false;
    global.backend.get_cursor_tracker().uninhibit_cursor_visibility();
  }

  private hidePointer(): void {
    this.pointerHidden = true;
    global.backend.get_cursor_tracker().inhibit_cursor_visibility();
  }
}

export class Farewell {
  private readonly blackout = new Blackout();
  private readonly subscriptions = [
    Gio.DBus.session.signal_subscribe(BUS_NAME, BUS_NAME, 'SessionOver', MANAGER_PATH, null,
      Gio.DBusSignalFlags.NONE, () => void this.blackout.fade()),
    Gio.DBus.session.signal_subscribe(BUS_NAME, BUS_NAME, 'SessionRunning', MANAGER_PATH, null,
      Gio.DBusSignalFlags.NONE, () => this.blackout.lift()),
  ];

  destroy(): void {
    for (const subscription of this.subscriptions) Gio.DBus.session.signal_unsubscribe(subscription);
    this.blackout.lift();
  }
}
