import GdkPixbuf from 'gi://GdkPixbuf';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const INSTALLED = GLib.build_filenamev([GLib.get_home_dir(), '.local/share/sabine']);
const FOLDERS = ['Desktop', 'Documents', 'Downloads', 'Music', 'Pictures', 'Videos'];
const DOCUMENTS = {
  'Documents/Trip to Lisbon.md': '# Lisbon\n\n- Tram 28 early, before the crowds\n- Pastéis in Belém\n- Sunset at Miradouro da Senhora do Monte\n',
  'Documents/Reading list.txt': 'The Overstory\nPiranesi\nKlara and the Sun\n',
  'Documents/Budget.csv': 'Month,Rent,Food,Travel\nJanuary,950,310,80\nFebruary,950,285,240\n',
  'Downloads/release-notes.txt': 'Fixed the sidebar flickering when the window is resized.\n',
  'Projects/garden-planner/README.md': '# Garden planner\n\nPlans the beds for next spring.\n',
};
const PICTURES = {'Pictures/Harbor.png': [38, 84, 124], 'Pictures/Meadow.png': [92, 132, 64], 'Pictures/Dusk.png': [148, 82, 112]};

const path = (...parts) => GLib.build_filenamev(parts);

function link(target, location) {
  const file = Gio.File.new_for_path(location);
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.UNKNOWN)
    file.make_symbolic_link(target, null);
}

function shareRuntime(sabine) {
  for (const folder of ['bin/versions', 'runtimes/cef']) {
    GLib.mkdir_with_parents(path(sabine, folder), 0o755);
    const children = Gio.File.new_for_path(path(INSTALLED, folder)).enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);
    for (const info of children)
      link(path(INSTALLED, folder, info.get_name()), path(sabine, folder, info.get_name()));
  }
  Gio.File.new_for_path(path(INSTALLED, 'bin/current.json'))
    .copy(Gio.File.new_for_path(path(sabine, 'bin/current.json')), Gio.FileCopyFlags.OVERWRITE, null, null);
  GLib.file_set_contents(path(sabine, 'service-policy.json'), JSON.stringify({login_autostart: false}));
}

function writeSamples(home) {
  for (const folder of FOLDERS) GLib.mkdir_with_parents(path(home, folder), 0o755);
  for (const [name, contents] of Object.entries(DOCUMENTS)) {
    GLib.mkdir_with_parents(GLib.path_get_dirname(path(home, name)), 0o755);
    GLib.file_set_contents(path(home, name), contents);
  }
  for (const [name, [red, green, blue]] of Object.entries(PICTURES)) {
    const picture = GdkPixbuf.Pixbuf.new(GdkPixbuf.Colorspace.RGB, false, 8, 640, 400);
    picture.fill(((red << 24) | (green << 16) | (blue << 8) | 0xff) >>> 0);
    picture.savev(path(home, name), 'png', [], []);
  }
}

export function prepareHome() {
  const home = path(GLib.get_user_state_dir(), 'luft-home');
  shareRuntime(path(GLib.get_user_data_dir(), 'sabine'));
  writeSamples(home);
  return home;
}
