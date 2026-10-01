import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gtk from 'gi://Gtk?version=4.0';

Gio._promisify(Gdk.Clipboard.prototype, 'read_async');
Gio._promisify(Gio.OutputStream.prototype, 'splice_async');

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.WindowCapture' });

async function showPasted(window) {
  const clipboard = window.get_clipboard();
  const [stream, mimeType] = await clipboard.read_async(clipboard.get_formats().get_mime_types(), GLib.PRIORITY_DEFAULT, null);
  const contents = Gio.MemoryOutputStream.new_resizable();
  await contents.splice_async(stream, Gio.OutputStreamSpliceFlags.CLOSE_SOURCE | Gio.OutputStreamSpliceFlags.CLOSE_TARGET, GLib.PRIORITY_DEFAULT, null);
  window.title = `Kestrel paste: ${mimeType} ${GLib.compute_checksum_for_bytes(GLib.ChecksumType.SHA1, contents.steal_as_bytes())}`;
}

function acceptPastes(window) {
  const keys = new Gtk.EventControllerKey();
  keys.connect('key-pressed', (_controller, keyval, _keycode, state) => {
    if (keyval !== Gdk.KEY_v || !(state & Gdk.ModifierType.CONTROL_MASK)) return false;
    showPasted(window).catch(logError);
    return true;
  });
  window.add_controller(keys);
  window.set_child(new Gtk.Label({ label: 'Paste here' }));
}

app.connect('activate', () => {
  for (let index = 0; index < (ARGV.includes('--multiple') ? 2 : 1); index++) {
    const window = new Gtk.ApplicationWindow({
      application: app,
      title: `Kestrel window check${ARGV.includes('--multiple') ? ` ${index + 1}` : ''}`,
      default_width: 680,
      default_height: 420,
  });
  if (ARGV.includes('--entry')) {
    const entry = new Gtk.Entry({ margin_top: 160, margin_start: 120, margin_end: 120, valign: Gtk.Align.START });
    entry.connect('changed', () => { window.title = `Kestrel entry: ${entry.text}`; });
    window.set_child(entry);
  } else if (ARGV.includes('--paste')) {
    acceptPastes(window);
  } else {
    window.set_child(new Gtk.Label({ label: 'A window managed by Kestrel' }));
  }
  window.present();
  }
});

app.run([]);
