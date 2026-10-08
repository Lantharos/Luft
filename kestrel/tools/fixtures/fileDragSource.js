import Gdk from 'gi://Gdk?version=4.0';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';

const app = new Gtk.Application({application_id: 'com.lantharos.Kestrel.FileDragSource'});

app.connect('activate', () => {
  const window = new Gtk.ApplicationWindow({application: app, title: 'Kestrel drag source', default_width: 320, default_height: 220});
  const label = new Gtk.Label({label: ARGV.map(path => Gio.File.new_for_path(path).get_basename()).join('\n')});
  const source = new Gtk.DragSource({actions: Gdk.DragAction.COPY});
  source.connect('prepare', () => Gdk.ContentProvider.new_for_value(Gdk.FileList.new_from_list(ARGV.map(path => Gio.File.new_for_path(path)))));
  label.add_controller(source);
  window.set_child(label);
  window.present();
});

app.run([]);
