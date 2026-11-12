import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GLibUnix from 'gi://GLibUnix';
import Gtk from 'gi://Gtk?version=4.0';

const TITLE = 'Kestrel file receiver';
const PASTE = 10;
const PROBE = 12;
const unhanded = ARGV;

const app = new Gtk.Application({ application_id: 'com.lantharos.Kestrel.FileReceiver', flags: Gio.ApplicationFlags.NON_UNIQUE });
let window: Gtk.ApplicationWindow;
let answers = 0;

const report = (answer: object) => { window.title = `${TITLE} ${++answers}: ${JSON.stringify(answer)}`; };

function read(path: string | null) {
  try {
    return { path, text: new TextDecoder().decode(Gio.File.new_for_path(path ?? '').load_contents(null)[1]) };
  } catch (error) {
    return { path, error: (error as GLib.Error).message };
  }
}

const received = (how: string, formats: Gdk.ContentFormats, files: Gio.File[]) =>
  report({ how, offered: formats.get_mime_types() ?? [], files: files.map(file => read(file.get_path())) });

function paste() {
  const clipboard = Gdk.Display.get_default()!.get_clipboard();
  clipboard.read_value_async(Gdk.FileList.$gtype, GLib.PRIORITY_DEFAULT, null, (_clipboard, result) => {
    try {
      received('paste', clipboard.get_formats(), (clipboard.read_value_finish(result) as Gdk.FileList).get_files());
    } catch (error) {
      report({ how: 'paste', offered: clipboard.get_formats().get_mime_types() ?? [], error: (error as GLib.Error).message });
    }
  });
}

const names = (folder: Gio.File) =>
  [...folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null)].map(info => info.get_name());

function shared() {
  const documents = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_runtime_dir(), 'doc']));
  try {
    return names(documents).map(id => names(documents.get_child(id)).join('/'));
  } catch (error) {
    return [(error as GLib.Error).message];
  }
}

function probe() {
  report({ how: 'probe', unhanded: unhanded.map(read), shared: shared() });
}

app.connect('activate', () => {
  window = new Gtk.ApplicationWindow({ application: app, title: TITLE, default_width: 480, default_height: 360 });
  const target = new Gtk.DropTarget({ actions: Gdk.DragAction.COPY });
  target.set_gtypes([Gdk.FileList.$gtype]);
  target.connect('drop', (_target, value) => {
    received('drop', target.get_current_drop()!.get_formats(), (value as Gdk.FileList).get_files());
    return true;
  });
  const area = new Gtk.Label({ label: 'Drop files here', hexpand: true, vexpand: true });
  area.add_controller(target);
  window.set_child(area);
  window.present();
});

GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, PASTE, () => { paste(); return GLib.SOURCE_CONTINUE; });
GLibUnix.signal_add(GLib.PRIORITY_DEFAULT, PROBE, () => { probe(); return GLib.SOURCE_CONTINUE; });
app.run([]);
