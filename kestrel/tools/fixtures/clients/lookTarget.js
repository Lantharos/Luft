import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

const name = ARGV[0] ?? 'Look target';

Gtk.init();
const window = new Gtk.Window({title: name, default_width: 480, default_height: 360});
const box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, homogeneous: true});
const entry = new Gtk.Entry({margin_start: 24, margin_end: 24});
const button = new Gtk.Button({label: 'Press'});
let presses = 0;
entry.connect('changed', () => window.set_title(`${name}: ${entry.text}`));
button.connect('clicked', () => window.set_title(`${name}: pressed ${++presses}`));
box.append(entry);
box.append(button);
window.set_child(box);

const loop = new GLib.MainLoop(null, false);
window.connect('close-request', () => loop.quit());
window.present();
loop.run();
