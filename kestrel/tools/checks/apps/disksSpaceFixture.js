import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export function writeSpaceFixture() {
  const root = GLib.build_filenamev([GLib.get_user_state_dir(), 'luft-home', 'Space']);
  const write = (name, bytes) => {
    const path = GLib.build_filenamev([root, name]);
    GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
    GLib.file_set_contents(path, new Uint8Array(bytes).fill(1));
  };
  write('Videos/trip.mov', 48 << 20);
  write('Videos/raw/take-1.mov', 24 << 20);
  write('Music/album/track.flac', 16 << 20);
  for (let index = 0; index < 40; index++) write(`Notes/note-${index}.md`, 2048);
  return root;
}

function children(folder) {
  const names = [];
  if (!folder.query_exists(null)) return names;
  const entries = folder.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
  for (let info = entries.next_file(null); info; info = entries.next_file(null)) names.push(info);
  return names;
}

export function remove(file) {
  for (const info of children(file)) {
    const child = file.get_child(info.get_name());
    if (info.get_file_type() === Gio.FileType.DIRECTORY) remove(child);
    else child.delete(null);
  }
  file.delete(null);
}

export function trashed(prefix) {
  const trash = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'Trash', 'files']));
  return children(trash).filter(info => info.get_name().startsWith(prefix)).length;
}
