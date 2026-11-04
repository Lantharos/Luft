import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { readText, userFile } from '../../appearance/files.js';

Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const FLATPAK_FOLDER = '.var/app/com.valvesoftware.Steam/.local/share/Steam';
const LIBRARY_ICON = /^[0-9a-f]{40}\.jpg$/;
const LIBRARY_ART_FOLDER = /^[0-9a-f]{40}$/;
const LIBRARY_ART = ['library_600x900.jpg', 'library_capsule.jpg', 'logo.png', 'library_header.jpg', 'header.jpg'];
const LISTED_FILES = 32;

export interface SteamGame {
  name: string;
  icon: string | null;
}

const steamFolders = () => [
  GLib.build_filenamev([GLib.get_home_dir(), FLATPAK_FOLDER]),
  GLib.build_filenamev([GLib.get_user_data_dir(), 'Steam']),
  GLib.build_filenamev([GLib.get_home_dir(), '.steam', 'steam']),
];

function vdfValues(text: string, key: string): string[] {
  return [...text.matchAll(new RegExp(`"${key}"\\s+"((?:[^"\\\\]|\\\\.)*)"`, 'gi'))]
    .map(([, value]) => value.replace(/\\(.)/g, '$1'));
}

async function libraries(folder: string): Promise<string[]> {
  const folders = await readText(userFile(folder, 'steamapps', 'libraryfolders.vdf'));
  return [...new Set([folder, ...vdfValues(folders ?? '', 'path')])];
}

async function installedName(folder: string, game: string): Promise<string | null> {
  for (const library of await libraries(folder)) {
    const manifest = await readText(userFile(library, 'steamapps', `appmanifest_${game}.acf`));
    const [name] = vdfValues(manifest ?? '', 'name');
    if (name) return name;
  }
  return null;
}

async function listed(folder: Gio.File): Promise<string[]> {
  try {
    const children = await folder.enumerate_children_async(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_DEFAULT, null);
    return (await children.next_files_async(LISTED_FILES, GLib.PRIORITY_DEFAULT, null)).map(info => info.get_name());
  } catch {
    return [];
  }
}

async function exists(file: Gio.File): Promise<boolean> {
  try {
    await file.query_info_async(Gio.FILE_ATTRIBUTE_STANDARD_TYPE, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_DEFAULT, null);
    return true;
  } catch {
    return false;
  }
}

async function themedIcon(game: string): Promise<string | null> {
  const name = `steam_icon_${game}`;
  const theme = userFile(GLib.get_user_data_dir(), 'icons', 'hicolor');
  for (const size of await listed(theme))
    if (await exists(theme.get_child(size).get_child('apps').get_child(`${name}.png`))) return name;
  return null;
}

async function cachedIcon(folder: string, game: string): Promise<string | null> {
  const cache = userFile(folder, 'appcache', 'librarycache', game);
  const names = await listed(cache);
  const icon = names.find(name => LIBRARY_ICON.test(name));
  if (icon) return cache.get_child(icon).get_path();
  const art = new Map(names.map(name => [name, cache.get_child(name)]));
  for (const name of names.filter(name => LIBRARY_ART_FOLDER.test(name))) {
    const nested = cache.get_child(name);
    for (const file of await listed(nested)) art.set(file, nested.get_child(file));
  }
  const found = LIBRARY_ART.find(name => art.has(name));
  return found ? art.get(found)!.get_path() : null;
}

export async function findSteamGame(game: string): Promise<SteamGame | null> {
  for (const folder of steamFolders()) {
    const name = await installedName(folder, game);
    if (!name) continue;
    return { name, icon: await themedIcon(game) ?? await cachedIcon(folder, game) };
  }
  return null;
}
