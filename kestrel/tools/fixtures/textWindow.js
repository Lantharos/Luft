import GLib from 'gi://GLib';

const version = ARGV[0] ?? '4.0';
const gtk3 = version === '3.0';
const {default: Gtk} = await import(`gi://Gtk?version=${version}`);

const SAMPLE = 'Wi-Fi, Bluetooth and 0123456789 — The quick brown fox jumps over the lazy dog';
const CODE = 'fn main() -> Result&lt;(), Error&gt; { 0x1F != 0o17 }';

const settings = () => Gtk.Settings.get_default();
const describe = () => `Kestrel text ${version}: ${settings().gtk_font_name}`;

function sampleBox() {
  const box = new Gtk.Box({orientation: Gtk.Orientation.VERTICAL, spacing: 10, margin_top: 24, margin_start: 24, margin_end: 24});
  for (const markup of [SAMPLE, `<b>${SAMPLE}</b>`, `<span font_family="monospace">${CODE}</span>`]) {
    const label = new Gtk.Label({label: markup, use_markup: true, xalign: 0});
    if (gtk3) box.add(label);
    else box.append(label);
  }
  return box;
}

if (gtk3) Gtk.init(null);
else Gtk.init();
const window = new Gtk.Window({title: describe(), default_width: 760, default_height: 200});
settings().connect('notify::gtk-font-name', () => window.set_title(describe()));
const loop = new GLib.MainLoop(null, false);
if (gtk3) {
  window.add(sampleBox());
  window.connect('destroy', () => loop.quit());
  window.show_all();
} else {
  window.set_child(sampleBox());
  window.connect('close-request', () => loop.quit());
  window.present();
}
loop.run();
