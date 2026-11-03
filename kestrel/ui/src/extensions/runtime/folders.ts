import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Manifest } from '../api/v1/types.js';
import { MANIFEST, parseManifest } from './manifest.js';

export type Origin = 'system' | 'user';

export interface Installed {
  id: string;
  path: string;
  origin: Origin;
  /** A user copy that replaces one the system ships. */
  overrides: boolean;
  manifest: Manifest | null;
  problem: string | null;
}

const decoder = new TextDecoder();
const SUBFOLDER = ['luft', 'extensions'];

export const userFolder = (): string => GLib.build_filenamev([GLib.get_user_data_dir(), ...SUBFOLDER]);
const systemFolders = (): string[] => GLib.get_system_data_dirs().map(folder => GLib.build_filenamev([folder, ...SUBFOLDER]));

function read(id: string, path: string, origin: Origin): Installed {
  const found: Installed = { id, path, origin, overrides: false, manifest: null, problem: null };
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

function children(folder: string): string[] {
  try {
    const enumerator = Gio.File.new_for_path(folder).enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
    const names: string[] = [];
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null))
      if (info.get_file_type() === Gio.FileType.DIRECTORY) names.push(info.get_name());
    return names;
  } catch {
    return [];
  }
}

export function findOne(id: string, hidden: ReadonlySet<string>): Installed | null {
  const user = GLib.build_filenamev([userFolder(), id]);
  const system = systemFolders().map(folder => GLib.build_filenamev([folder, id])).find(path => GLib.file_test(GLib.build_filenamev([path, MANIFEST]), GLib.FileTest.EXISTS));
  if (GLib.file_test(user, GLib.FileTest.IS_DIR)) return { ...read(id, user, 'user'), overrides: !!system };
  return system && !hidden.has(id) ? read(id, system, 'system') : null;
}

/** Every installed extension once: a user copy wins over the system's, and earlier system folders over later ones. */
export function discover(hidden: ReadonlySet<string>): Installed[] {
  const ids = new Set([userFolder(), ...systemFolders()].flatMap(children));
  return [...ids].sort().map(id => findOne(id, hidden)).filter(found => found !== null);
}
