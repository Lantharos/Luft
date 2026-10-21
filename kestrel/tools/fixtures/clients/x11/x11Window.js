import Gdk from 'gi://Gdk?version=3.0';
import Gtk from 'gi://Gtk?version=3.0';

const [title, background, copied] = ARGV;

Gdk.set_allowed_backends('x11');
Gtk.init(null);

const css = new Gtk.CssProvider();
css.load_from_data(`window { background: ${background}; }`);
Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(), css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

const window = new Gtk.Window({title, default_width: 560, default_height: 340});
window.connect('destroy', () => Gtk.main_quit());
window.show_all();

if (copied) {
  const clipboard = Gtk.Clipboard.get(Gdk.Atom.intern('CLIPBOARD', false));
  clipboard.set_text(copied, -1);
  window.connect('key-press-event', () => {
    clipboard.clear();
    return true;
  });
}
Gtk.main();
