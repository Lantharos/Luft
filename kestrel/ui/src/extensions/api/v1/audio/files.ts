import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

/** A file the extension names by a path in its folder or its data folder, which may not lead anywhere else. */
export function extensionFile(folders: readonly string[], path: string): Gio.File {
  const file = Gio.File.new_for_path(GLib.path_is_absolute(path) ? path : GLib.build_filenamev([folders[0], path]));
  if (!folders.some(folder => file.has_prefix(Gio.File.new_for_path(folder)))) throw new Error(`${path} is outside the extension's folders`);
  return file;
}
