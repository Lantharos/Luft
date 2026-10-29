import Gdk from 'gi://Gdk?version=4.0';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

const [title, background] = ARGV;

Gtk.init();
const css = new Gtk.CssProvider();
css.load_from_string(`window, headerbar { background: ${background}; }
window.csd { box-shadow: 0 0 0 1px ${background}, 0 4px 16px rgba(0, 0, 0, 0.4); outline: none; }`);
Gtk.StyleContext.add_provider_for_display(Gdk.Display.get_default()!, css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);

const loop = new GLib.MainLoop(null, false);
const window = new Gtk.Window({title, default_width: 400, default_height: 240});
window.connect('close-request', () => { loop.quit(); return false; });
window.present();
loop.run();
