import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Manifest } from '../api/v1/types.js';
import { MANIFEST, parseManifest } from './manifest.js';

export interface Installed {
  id: string;
  path: string;
  manifest: Manifest | null;
  problem: string | null;
}

const decoder = new TextDecoder();
const FOLDER = GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extensions']);

function read(id: string): Installed {
  const path = GLib.build_filenamev([FOLDER, id]);
  const found: Installed = { id, path, manifest: null, problem: null };
  try {
    const [, contents] = GLib.file_get_contents(GLib.build_filenamev([path, MANIFEST]));
    const manifest = parseManifest(decoder.decode(contents));
    if (manifest.id !== id) found.problem = `its manifest names ${manifest.id}, not its folder's name`;
    else found.manifest = manifest;
  } catch (error) {
    found.problem = error instanceof GLib.Error ? `${MANIFEST} can't be read: ${error.message}` : (error as Error).message;
  }
  return found;
}

function children(): string[] {
  try {
    const enumerator = Gio.File.new_for_path(FOLDER).enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
    const names: string[] = [];
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null))
      if (info.get_file_type() === Gio.FileType.DIRECTORY) names.push(info.get_name());
    return names;
  } catch {
    return [];
  }
}

export function findOne(id: string): Installed | null {
  return GLib.file_test(GLib.build_filenamev([FOLDER, id]), GLib.FileTest.IS_DIR) ? read(id) : null;
}

export function discover(): Installed[] {
  return children().sort().map(read);
}

export function dataFolder(id: string): string {
  return GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', id]);
}

export function storageFile(id: string): string {
  return GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${id}.json`]);
}

export function removeTree(file: Gio.File): void {
  if (file.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    const children = file.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    for (let info = children.next_file(null); info; info = children.next_file(null)) removeTree(file.get_child(info.get_name()));
  }
  file.delete(null);
}
