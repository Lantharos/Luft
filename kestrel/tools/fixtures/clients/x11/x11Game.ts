import Gdk from 'gi://Gdk?version=3.0';
import Gtk from 'gi://Gtk?version=3.0';

const [title] = ARGV;

Gdk.set_allowed_backends('x11');
Gtk.init(null);

const window = new Gtk.Window({title});
window.connect('destroy', () => Gtk.main_quit());
window.connect('key-press-event', () => {
  const seat = Gdk.Display.get_default()!.get_default_seat()!;
  const status = seat.grab(window.get_window()!, Gdk.SeatCapabilities.KEYBOARD, false, null, null, null);
  print(status === Gdk.GrabStatus.SUCCESS ? 'grabbed' : `not grabbed ${status}`);
  return true;
});
window.fullscreen();
window.show_all();
Gtk.main();
