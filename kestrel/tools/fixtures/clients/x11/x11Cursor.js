import Gdk from 'gi://Gdk?version=3.0';
import Gtk from 'gi://Gtk?version=3.0';

Gdk.set_allowed_backends('x11');
Gtk.init(null);

const settings = Gtk.Settings.get_default();
const report = () => print(JSON.stringify({ theme: settings.gtk_cursor_theme_name, size: settings.gtk_cursor_theme_size, imModule: settings.gtk_im_module }));
settings.connect('notify::gtk-cursor-theme-name', report);
settings.connect('notify::gtk-cursor-theme-size', report);
report();
Gtk.main();
