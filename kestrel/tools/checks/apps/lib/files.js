import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export const exists = path => GLib.file_test(path, GLib.FileTest.EXISTS);
export const read = path => new TextDecoder().decode(GLib.file_get_contents(path)[1]);

export function children(folder) {
  const file = Gio.File.new_for_path(folder);
  if (!file.query_exists(null)) return [];
  return [...file.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null)];
}

export function removeTree(path) {
  for (const info of children(path)) {
    const child = GLib.build_filenamev([path, info.get_name()]);
    if (info.get_file_type() === Gio.FileType.DIRECTORY) removeTree(child);
    else GLib.unlink(child);
  }
  GLib.rmdir(path);
}

export function write(path, contents) {
  GLib.mkdir_with_parents(GLib.path_get_dirname(path), 0o755);
  GLib.file_set_contents(path, contents);
}
