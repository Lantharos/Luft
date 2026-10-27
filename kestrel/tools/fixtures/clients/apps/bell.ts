import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

Gtk.init();
const display = Gdk.Display.get_default()!;
display.beep();
display.flush();
const loop = new GLib.MainLoop(null, false);
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
  loop.quit();
  return GLib.SOURCE_REMOVE;
});
loop.run();
