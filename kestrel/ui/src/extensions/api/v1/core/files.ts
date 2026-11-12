import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { confinedFile, realPath } from './confined.js';

Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');

export interface OwnFolders {
  readonly path: string;
  readonly dataPath: string;
}

export function removeTree(file: Gio.File): void {
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    const children = file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    for (let info = children.next_file(null); info; info = children.next_file(null)) removeTree(file.get_child(info.get_name()));
  }
  file.delete(null);
}

export function deleteFile({ dataPath }: OwnFolders, path: string): void {
  const file = confinedFile([dataPath], path);
  if (file.get_path() === realPath(dataPath)) throw new Error("The data folder itself can't be deleted");
  removeTree(file);
}

export function readText({ path: folder, dataPath }: OwnFolders, path: string): string | null {
  const file = confinedFile([folder, dataPath], path);
  if (!file.query_exists(null)) return null;
  return new TextDecoder().decode(file.load_contents(null)[1]);
}

export function replaceFile(file: Gio.File, text: string): Promise<unknown> {
  const contents = new GLib.Bytes(new TextEncoder().encode(text));
  return file.replace_contents_bytes_async(contents, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
}

export function writeText({ dataPath }: OwnFolders, path: string, text: string): Promise<unknown> {
  GLib.mkdir_with_parents(dataPath, 0o700);
  return replaceFile(confinedFile([dataPath], path), text);
}
