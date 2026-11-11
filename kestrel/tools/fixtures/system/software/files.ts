import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type {Publish} from '../bus.js';

const FILES = `<node><interface name="com.lantharos.Files1">
  <method name="Copy"><arg name="items" type="a(ayay)" direction="in"/></method>
  <method name="Move"><arg name="items" type="a(ayay)" direction="in"/></method>
  <method name="Delete"><arg name="paths" type="aay" direction="in"/></method>
  <method name="Trash"><arg name="paths" type="aay" direction="in"/><arg name="trashed" type="a(ayay)" direction="out"/></method>
  <method name="MakeFolder"><arg name="path" type="ay" direction="in"/><arg name="created" type="b" direction="out"/></method>
  <method name="MakeFile"><arg name="path" type="ay" direction="in"/></method>
</interface></node>`;

type Bytes = Uint8Array;
type Pair = [Bytes, Bytes];

export const FILES_NAME = 'com.lantharos.Files1';

const WRITABLE = 0o200;
const decoder = new TextDecoder();
const encoder = new TextEncoder();
const text = (bytes: Bytes) => decoder.decode(bytes);
const folderOf = (path: string) => GLib.path_get_dirname(path);
const modeOf = (path: string) => Gio.File.new_for_path(path).query_info('unix::mode', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null).get_attribute_uint32('unix::mode') & 0o7777;

function unlocked<T>(folder: string, change: () => T): T {
  const mode = modeOf(folder);
  GLib.chmod(folder, mode | WRITABLE);
  try {
    return change();
  } finally {
    GLib.chmod(folder, mode);
  }
}

function remove(path: string) {
  const file = Gio.File.new_for_path(path);
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    unlocked(path, () => {
      for (const info of file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null)) remove(GLib.build_filenamev([path, info.get_name()]));
    });
  }
  file.delete(null);
}

function place(source: string, target: string, placing: (from: Gio.File, to: Gio.File) => void) {
  unlocked(folderOf(source), () => unlocked(folderOf(target), () => placing(Gio.File.new_for_path(source), Gio.File.new_for_path(target))));
}

function trash(path: string): Pair {
  const bin = GLib.build_filenamev([GLib.get_user_data_dir(), 'Trash']);
  const name = GLib.path_get_basename(path);
  const file = GLib.build_filenamev([bin, 'files', name]);
  const info = GLib.build_filenamev([bin, 'info', `${name}.trashinfo`]);
  for (const folder of [folderOf(file), folderOf(info)]) GLib.mkdir_with_parents(folder, 0o700);
  GLib.file_set_contents(info, `[Trash Info]\nPath=${GLib.uri_escape_string(path, '/', false)}\nDeletionDate=${GLib.DateTime.new_now_local().format('%Y-%m-%dT%H:%M:%S')}\n`);
  unlocked(folderOf(path), () => Gio.File.new_for_path(path).move(Gio.File.new_for_path(file), Gio.FileCopyFlags.NOFOLLOW_SYMLINKS, null, null));
  return [encoder.encode(file), encoder.encode(info)];
}

export function publishFiles(publish: Publish, calls: string[]) {
  const noted = <T>(method: string, items: unknown[], change: () => T): T => {
    calls.push(`Files1.${method} ${items.length}`);
    return change();
  };
  publish(FILES, {
    Copy: (items: Pair[]) => noted('Copy', items, () => items.forEach(([source, target]) =>
      place(text(source), text(target), (from, to) => from.copy(to, Gio.FileCopyFlags.NOFOLLOW_SYMLINKS, null, null)))),
    Move: (items: Pair[]) => noted('Move', items, () => items.forEach(([source, target]) =>
      place(text(source), text(target), (from, to) => from.move(to, Gio.FileCopyFlags.NOFOLLOW_SYMLINKS, null, null)))),
    Delete: (paths: Bytes[]) => noted('Delete', paths, () => paths.forEach(path => unlocked(folderOf(text(path)), () => remove(text(path))))),
    Trash: (paths: Bytes[]) => noted('Trash', paths, () => paths.map(path => trash(text(path)))),
    MakeFolder: (path: Bytes) => noted('MakeFolder', [path], () => unlocked(folderOf(text(path)), () => GLib.mkdir_with_parents(text(path), 0o755) === 0)),
    MakeFile: (path: Bytes) => noted('MakeFile', [path], () => unlocked(folderOf(text(path)), () => GLib.file_set_contents(text(path), ''))),
  }, '/com/lantharos/Files1');
}
