import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

export function blinkCaret(entry: St.Entry): void {
  const text = entry.clutter_text;
  const preferences = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
  let timer = 0;
  const stop = () => {
    if (timer) GLib.Source.remove(timer);
    timer = 0;
  };
  const restart = () => {
    stop();
    if (!text.has_key_focus() || !text.mapped) return;
    text.cursor_visible = true;
    const interval = Math.max(100, preferences.get_int('cursor-blink-time') / 2);
    timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
      text.cursor_visible = !text.cursor_visible;
      return GLib.SOURCE_CONTINUE;
    });
  };
  text.connect('key-focus-in', restart);
  text.connect('key-focus-out', stop);
  text.connect('notify::mapped', restart);
  text.connect('notify::cursor-position', restart);
  text.connect('text-changed', restart);
  text.connect('key-press-event', () => { restart(); return Clutter.EVENT_PROPAGATE; });
  text.connect('button-press-event', () => { restart(); return Clutter.EVENT_PROPAGATE; });
  entry.connect('destroy', stop);
}
