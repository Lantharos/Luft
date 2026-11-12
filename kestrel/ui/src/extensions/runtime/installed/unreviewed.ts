import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { onlySystemCanChangeFile, unreviewedSource } from './origins.js';

const PACKAGES = 'com.lantharos.Packages1';
const PACKAGES_PATH = '/com/lantharos/Packages1';
const FOLDERS = '.folders.json';
const CALL_TIMEOUT = 60000;

const decoder = new TextDecoder();

export function approvedFolders(): Map<string, string> {
  const source = unreviewedSource();
  const record = GLib.build_filenamev([source.folder, FOLDERS]);
  if (source.heldBySystem && !onlySystemCanChangeFile(record)) return new Map();
  try {
    const folders = JSON.parse(decoder.decode(GLib.file_get_contents(record)[1])) as Record<string, unknown>;
    return new Map(Object.entries(folders).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch {
    return new Map();
  }
}

export async function removeUnreviewed(id: string): Promise<void> {
  await Gio.DBus.system.call(PACKAGES, PACKAGES_PATH, PACKAGES, 'RemoveUnreviewedExtension', new GLib.Variant('(s)', [id]), null,
    Gio.DBusCallFlags.NONE, CALL_TIMEOUT, null);
}
