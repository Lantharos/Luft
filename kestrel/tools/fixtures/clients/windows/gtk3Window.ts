import Gdk from 'gi://Gdk?version=3.0';
import Gtk from 'gi://Gtk?version=3.0';

const [title, background, backend, decorations] = ARGV;

Gdk.set_allowed_backends(backend);
Gtk.init(null);

const css = new Gtk.CssProvider();
css.load_from_data(`window, headerbar { background: ${background}; }`);
Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default()!, css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

const window = new Gtk.Window({title, default_width: 400, default_height: 240});
if (decorations === 'none') window.decorated = false;
else window.set_titlebar(new Gtk.HeaderBar({title, show_close_button: true}));
window.connect('destroy', () => Gtk.main_quit());
window.show_all();
Gtk.main();
