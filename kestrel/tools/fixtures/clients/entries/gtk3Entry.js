import Gtk from 'gi://Gtk?version=3.0';

Gtk.init(null);
const window = new Gtk.Window({title: 'Kestrel entry: ', default_width: 680, default_height: 420});
const entry = new Gtk.Entry({margin_top: 160, margin_start: 120, margin_end: 120, valign: Gtk.Align.START});
entry.connect('changed', () => window.set_title(`Kestrel entry: ${entry.text}`));
window.add(entry);
window.connect('destroy', () => Gtk.main_quit());
window.show_all();
Gtk.main();
