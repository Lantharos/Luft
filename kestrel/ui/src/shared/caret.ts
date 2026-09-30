import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

const BLINK_KEYS = ['cursor-blink', 'cursor-blink-time', 'cursor-blink-timeout'];

export class CaretBlink {
  private readonly preferences = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  private readonly changed: number;
  private timer = 0;
  private running = false;

  constructor(private readonly show: (visible: boolean) => void) {
    this.changed = this.preferences.connect('changed', (_settings, key) => {
      if (this.running && BLINK_KEYS.includes(key)) this.restart();
    });
  }

  restart(): void {
    this.stop();
    this.running = true;
    this.show(true);
    if (!this.preferences.get_boolean('cursor-blink')) return;
    const deadline = GLib.get_monotonic_time() + this.preferences.get_int('cursor-blink-timeout') * 1_000_000;
    const interval = Math.max(100, this.preferences.get_int('cursor-blink-time') / 2);
    let visible = true;
    this.timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
      visible = GLib.get_monotonic_time() >= deadline || !visible;
      this.show(visible);
      if (GLib.get_monotonic_time() < deadline) return GLib.SOURCE_CONTINUE;
      this.timer = 0;
      return GLib.SOURCE_REMOVE;
    });
  }

  stop(): void {
    if (this.timer) GLib.Source.remove(this.timer);
    this.timer = 0;
    this.running = false;
  }

  destroy(): void {
    this.stop();
    this.preferences.disconnect(this.changed);
  }
}

export function blinkCaret(entry: St.Entry): void {
  const text = entry.clutter_text;
  const blink = new CaretBlink(visible => { text.cursor_visible = visible; });
  const restart = () => text.has_key_focus() && text.mapped ? blink.restart() : blink.stop();
  text.connect('key-focus-in', restart);
  text.connect('key-focus-out', () => blink.stop());
  text.connect('notify::mapped', restart);
  text.connect('notify::cursor-position', restart);
  text.connect('text-changed', restart);
  text.connect('key-press-event', () => { restart(); return Clutter.EVENT_PROPAGATE; });
  text.connect('button-press-event', () => { restart(); return Clutter.EVENT_PROPAGATE; });
  entry.connect('destroy', () => blink.destroy());
}
