import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { developmentPath } from '../../../shared/apps/development.js';

export type Origin = 'store' | 'copy' | 'development' | 'folder' | 'own';

export interface Source {
  origin: Origin;
  folder: string;
  heldBySystem: boolean;
}

const STORE = '/var/lib/luft/extensions';
const UNREVIEWED = '/var/lib/luft/unreviewed-extensions';
const WRITABLE_BY_OTHERS = 0o022;
const ATTRIBUTES = 'standard::type,unix::uid,unix::mode';

const uid = new Gio.Credentials().get_unix_user();

function systemOnly(path: string, type = Gio.FileType.DIRECTORY): boolean {
  try {
    const info = Gio.File.new_for_path(path).query_info(ATTRIBUTES, Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    return info.get_file_type() === type && info.get_attribute_uint32('unix::uid') === 0 &&
      (info.get_attribute_uint32('unix::mode') & WRITABLE_BY_OTHERS) === 0;
  } catch {
    return false;
  }
}

function everyFolderOn(path: string): string[] {
  const folders = [path];
  for (let parent = GLib.path_get_dirname(path); parent !== folders.at(-1); parent = GLib.path_get_dirname(parent)) folders.push(parent);
  return folders;
}

export function onlySystemCanChange(path: string): boolean {
  return everyFolderOn(path).every(folder => systemOnly(folder));
}

export function onlySystemCanChangeFile(path: string): boolean {
  return systemOnly(path, Gio.FileType.REGULAR) && onlySystemCanChange(GLib.path_get_dirname(path));
}

export function unreviewedSource(): Source {
  const unreviewed = developmentPath('KESTREL_UNREVIEWED_EXTENSIONS');
  return { origin: 'copy', folder: unreviewed ?? GLib.build_filenamev([UNREVIEWED, `${uid}`]), heldBySystem: !unreviewed };
}

export function sources(): Source[] {
  const store = developmentPath('KESTREL_STORE_EXTENSIONS');
  const development = developmentPath('KESTREL_DEVELOPMENT_EXTENSIONS');
  return [
    { origin: 'store', folder: store ?? GLib.build_filenamev([STORE, `${uid}`]), heldBySystem: !store },
    unreviewedSource(),
    ...development ? [{ origin: 'development' as const, folder: development, heldBySystem: false }] : [],
    { origin: 'own', folder: GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extensions']), heldBySystem: false },
  ];
}

export const unreviewed = (origin: Origin) => origin === 'copy' || origin === 'folder';
