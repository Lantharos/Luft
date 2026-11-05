import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

Gtk.init();
const window = new Gtk.Window({title: 'Kestrel entry: |', default_width: 680, default_height: 420});
const box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 12, valign: Gtk.Align.CENTER, margin_start: 120, margin_end: 120});
const name = new Gtk.Entry();
const password = new Gtk.PasswordEntry();
const showTyped = () => window.set_title(`Kestrel entry: ${name.text}|${password.text}`);
name.connect('changed', showTyped);
password.connect('changed', showTyped);
box.append(name);
box.append(password);
window.set_child(box);
const loop = new GLib.MainLoop(null, false);
window.connect('close-request', () => {
  loop.quit();
  return false;
});
window.present();
loop.run();
