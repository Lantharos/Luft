import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

const FORMAT_KEYS = ['clock-format', 'clock-show-seconds', 'clock-show-weekday'];

export class PanelClock {
  readonly actor = new St.Label({ style_class: 'kestrel-clock', y_align: Clutter.ActorAlign.CENTER });
  private readonly settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly changed: number;
  private timer = 0;

  constructor() {
    this.actor.clutter_text.set_line_alignment(Pango.Alignment.RIGHT);
    this.changed = this.settings.connect('changed', (_settings, key) => {
      if (!FORMAT_KEYS.includes(key)) return;
      this.stop();
      this.tick();
    });
    this.tick();
  }

  destroy(): void {
    this.settings.disconnect(this.changed);
    this.stop();
  }

  private get seconds(): boolean {
    return this.settings.get_boolean('clock-show-seconds');
  }

  private format(): string {
    const seconds = this.seconds ? ':%S' : '';
    const time = this.settings.get_string('clock-format') === '12h' ? `%-l:%M${seconds} %p` : `%H:%M${seconds}`;
    const date = this.settings.get_boolean('clock-show-weekday') ? '%a %-d %b' : '%-d %b';
    return `${date}\n${time}`;
  }

  private tick(): void {
    const now = GLib.DateTime.new_now_local();
    const text = now.format(this.format()) ?? '';
    if (this.actor.text !== text) this.actor.text = text;
    const wait = this.seconds ? 1000 - Math.floor(now.get_microsecond() / 1000) : (60 - now.get_second()) * 1000;
    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, wait, () => {
      this.timer = 0;
      this.tick();
      return GLib.SOURCE_REMOVE;
    });
  }

  private stop(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
  }
}
