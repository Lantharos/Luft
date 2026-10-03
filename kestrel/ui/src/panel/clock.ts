import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';
import { WallClock } from 'resource:///org/gnome/shell/misc/wallClock.js';

export class PanelClock {
  readonly actor = new St.Label({ style_class: 'kestrel-clock', y_align: Clutter.ActorAlign.CENTER });
  private readonly clock: WallClock;

  constructor() {
    this.actor.clutter_text.set_line_alignment(Pango.Alignment.RIGHT);
    this.clock = new WallClock((now, clock) => this.update(now, clock));
  }

  destroy(): void {
    this.clock.destroy();
  }

  private update(now: GLib.DateTime, clock: WallClock): void {
    const seconds = clock.showSeconds ? ':%S' : '';
    const time = clock.twelveHour ? `%-l:%M${seconds} %p` : `%H:%M${seconds}`;
    const date = clock.settings.get_boolean('clock-show-weekday') ? '%a %-d %b' : '%-d %b';
    const text = now.format(`${date}\n${time}`) ?? '';
    if (this.actor.text !== text) this.actor.text = text;
  }
}
