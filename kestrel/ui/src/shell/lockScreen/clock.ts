import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';

import { formatLongDate, formatTime } from '../../shared/time/dateUtils.js';
import { WallClock } from '../../shared/time/wallClock.js';

const HINT_TIMEOUT = 4;
const CROSSFADE_TIME = 300;

export const Clock = GObject.registerClass(
class LockClock extends St.BoxLayout {
  private readonly time: St.Label;
  private readonly date: St.Label;
  private readonly hint: St.Label;
  private readonly seat: Clutter.Seat;
  private readonly wallClock: WallClock;

  constructor() {
    super({
      style_class: 'unlock-dialog-clock',
      orientation: Clutter.Orientation.VERTICAL,
    });

    this.time = new St.Label({
      style_class: 'unlock-dialog-clock-time',
      x_align: Clutter.ActorAlign.CENTER,
    });
    this.date = new St.Label({
      style_class: 'unlock-dialog-clock-date',
      x_align: Clutter.ActorAlign.CENTER,
    });
    this.hint = new St.Label({
      style_class: 'unlock-dialog-clock-hint',
      x_align: Clutter.ActorAlign.CENTER,
      opacity: 0,
    });

    this.add_child(this.time);
    this.add_child(this.date);
    this.add_child(this.hint);

    this.seat = this.get_context().get_backend().get_default_seat();
    this.seat.connectObject('notify::touch-mode', () => this.updateHint(), this);

    global.backend.get_monitor_manager().connectObject('power-save-mode-changed',
      () => (this.hint.opacity = 0), this);

    const idleMonitor = global.backend.get_core_idle_monitor();
    const idleWatchId = idleMonitor.add_idle_watch(HINT_TIMEOUT * 1000, () => {
      this.hint.ease({ opacity: 255, duration: CROSSFADE_TIME });
    });

    this.wallClock = new WallClock((now: GLib.DateTime, clock: WallClock) => this.updateClock(now, clock));
    KestrelUi.localized(this, () => {
      this.updateClock(GLib.DateTime.new_now_local(), this.wallClock);
      this.updateHint();
    });

    this.connect('destroy', () => {
      this.wallClock.destroy();
      idleMonitor.remove_watch(idleWatchId);
    });
  }

  private updateClock(now: GLib.DateTime, clock: WallClock): void {
    this.time.text = formatTime(now, { twelveHour: clock.twelveHour, seconds: clock.showSeconds });
    this.date.text = formatLongDate(now);
  }

  private updateHint(): void {
    this.hint.text = KestrelUi.t(this.seat.touch_mode ? 'lock-clock-swipe-up' : 'lock-clock-click-or-press');
  }
});
export type Clock = InstanceType<typeof Clock>;
