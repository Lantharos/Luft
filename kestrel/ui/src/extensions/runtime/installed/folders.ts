import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import type { Manifest } from '../../api/v1/types.js';
import { MANIFEST } from '../layout.js';
import { parseManifest } from '../manifest.js';
import { onlySystemCanChange, sources, unreviewed, type Origin, type Source } from './origins.js';
import { approvedFolders } from './unreviewed.js';

export interface Installed {
  id: string;
  path: string;
  origin: Origin;
  systemOwned: boolean;
  inShell: boolean;
  manifest: Manifest | null;
  problem: string | null;
  ignored: string[];
}

const decoder = new TextDecoder();

interface Looking {
  folders: Map<string, string>;
  unreviewedInShell: boolean;
}

function originOf(id: string, path: string, source: Source, systemOwned: boolean, folders: Map<string, string>): Origin {
  if (source.heldBySystem && !systemOwned) return 'own';
  if (source.origin === 'own' && folders.get(id) === path) return 'folder';
  return source.origin;
}

function read(id: string, source: Source, { folders, unreviewedInShell }: Looking): Installed {
  const path = GLib.build_filenamev([source.folder, id]);
  const systemOwned = source.heldBySystem && onlySystemCanChange(path);
  const origin = originOf(id, path, source, systemOwned, folders);
  const inShell = unreviewed(origin) ? unreviewedInShell : origin !== 'own';
  const found: Installed = { id, path, origin, systemOwned, inShell, manifest: null, problem: null, ignored: [] };
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
    const enumerator = Gio.File.new_for_path(folder).enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    const names: string[] = [];
    for (let info = enumerator.next_file(null); info; info = enumerator.next_file(null))
      if (info.get_file_type() === Gio.FileType.DIRECTORY && !info.get_name().startsWith('.')) names.push(info.get_name());
    return names;
  } catch {
    return [];
  }
}

function collect(found: Map<string, Installed>, id: string, source: Source, looking: Looking): void {
  const earlier = found.get(id);
  if (earlier) earlier.ignored.push(GLib.build_filenamev([source.folder, id]));
  else found.set(id, read(id, source, looking));
}

export function findOne(id: string, unreviewedInShell: boolean): Installed | null {
  const found = new Map<string, Installed>();
  const looking = { folders: approvedFolders(), unreviewedInShell };
  for (const source of sources()) {
    const folder = Gio.File.new_for_path(GLib.build_filenamev([source.folder, id]));
    if (folder.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) collect(found, id, source, looking);
  }
  return found.get(id) ?? null;
}

export function discover(unreviewedInShell: boolean): Installed[] {
  const found = new Map<string, Installed>();
  const looking = { folders: approvedFolders(), unreviewedInShell };
  for (const source of sources())
    for (const id of children(source.folder)) collect(found, id, source, looking);
  return [...found.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function dataFolder(id: string): string {
  return GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extension-data', id]);
}

export function storageFile(id: string): string {
  return GLib.build_filenamev([GLib.get_user_state_dir(), 'luft', 'extension-storage', `${id}.json`]);
}
