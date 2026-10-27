import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';
import { WallClock } from '../../../shared/time/wallClock.js';

import { onLocaleChanged } from '../../../shared/i18n/index.js';
import { dateText, timeText } from './clockText.js';

export class PanelClock {
  readonly actor = new St.Label({ style_class: 'kestrel-clock', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock: WallClock;
  private readonly forgetLocale = onLocaleChanged(() => this.update(GLib.DateTime.new_now_local(), this.clock));

  constructor(private readonly timeOnly = false) {
    this.actor.clutter_text.set_line_alignment(Pango.Alignment.RIGHT);
    this.clock = new WallClock((now, clock) => this.update(now, clock));
  }

  destroy(): void {
    this.clock.destroy();
    this.forgetLocale();
  }

  private update(now: GLib.DateTime, clock: WallClock): void {
    const time = timeText(now, clock.twelveHour, clock.showSeconds);
    const text = this.timeOnly ? time : `${dateText(now, clock.settings.get_boolean('clock-show-weekday'))}\n${time}`;
    if (this.actor.text !== text) this.actor.text = text;
  }
}
