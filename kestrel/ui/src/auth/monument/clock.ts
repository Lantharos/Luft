import GLib from 'gi://GLib';
import St from 'gi://St';

import * as KestrelUi from '../../kestrelUi.js';
import { formatLongDate, formatTime } from '../../shared/time/dateUtils.js';
import { WallClock } from '../../shared/time/wallClock.js';

export class MonumentClock {
  readonly time = new St.Label({ name: 'kestrel-lock-time', style_class: 'kestrel-lock-time' });
  readonly date = new St.Label({ name: 'kestrel-lock-date', style_class: 'kestrel-lock-date' });
  private readonly wallClock = new WallClock((now: GLib.DateTime, clock: WallClock) => this.update(now, clock));

  constructor() {
    KestrelUi.localized(this.time, () => this.update(GLib.DateTime.new_now_local(), this.wallClock));
    this.time.connect('destroy', () => this.wallClock.destroy());
  }

  private update(now: GLib.DateTime, clock: WallClock): void {
    this.time.text = formatTime(now, { twelveHour: clock.twelveHour, seconds: clock.showSeconds });
    this.date.text = formatLongDate(now);
  }
}
