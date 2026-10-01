import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import Shell from 'gi://Shell';

import { animateActor } from '../shared/motion.js';
import { BUS_NAME, FAREWELL_DURATION, MANAGER_PATH } from './interfaces.js';

export class Farewell {
  private cover: Clutter.Actor | null = null;
  private readonly subscriptions = [
    Gio.DBus.session.signal_subscribe(BUS_NAME, BUS_NAME, 'SessionOver', MANAGER_PATH, null,
      Gio.DBusSignalFlags.NONE, () => this.fade()),
    Gio.DBus.session.signal_subscribe(BUS_NAME, BUS_NAME, 'SessionRunning', MANAGER_PATH, null,
      Gio.DBusSignalFlags.NONE, () => this.lift()),
  ];

  private fade(): void {
    const stage = (global as unknown as Shell.Global).stage;
    this.lift();
    const cover = this.cover = new Clutter.Actor({
      background_color: new Cogl.Color({ red: 0, green: 0, blue: 0, alpha: 255 }),
      opacity: 0,
      reactive: true,
      constraints: new Clutter.BindConstraint({ source: stage, coordinate: Clutter.BindCoordinate.ALL }),
    });
    stage.add_child(cover);
    animateActor(cover, { opacity: 255, duration: FAREWELL_DURATION, mode: Clutter.AnimationMode.EASE_IN_QUAD });
  }

  private lift(): void {
    this.cover?.destroy();
    this.cover = null;
  }

  destroy(): void {
    for (const subscription of this.subscriptions) Gio.DBus.session.signal_unsubscribe(subscription);
    this.lift();
  }
}
