import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {descendants} from '../../lib/actors.js';
import {call} from '../../lib/dbus.js';
import {builtExtension, fixture} from '../../lib/processes.js';

const NAME = 'com.lantharos.Kestrel';
const PATH = '/com/lantharos/Kestrel/Extensions';
const IFACE = 'com.lantharos.Kestrel.Extensions';

export const SEASONS = 'com.lantharos.Seasons';

export interface Listed {
  id: string;
  name: string;
  version?: string;
  origin: string;
  ignored: string[];
  enabled: boolean;
  state: string;
  problem: string;
  settings?: {key: string; value: boolean | number | string | string[]; depends?: string; when?: unknown[]; 'when-min'?: number}[];
}

export async function list(): Promise<Listed[]> {
  const reply = await call(NAME, PATH, IFACE, 'List', null, '(aa{sv})');
  return reply.recursiveUnpack<[Listed[]]>()[0];
}

export const listed = async (id: string) => (await list()).find(extension => extension.id === id) ?? null;

export const request = (method: 'Enable' | 'Disable' | 'Reload' | 'Remove', id: string) =>
  call(NAME, PATH, IFACE, method, new GLib.Variant('(s)', [id]));

export function setSetting(id: string, key: string, value: GLib.Variant) {
  return call(NAME, PATH, IFACE, 'SetSetting', new GLib.Variant('(ssv)', [id, key, value]));
}

export async function setting(id: string, key: string) {
  return (await listed(id))?.settings?.find(described => described.key === key)?.value;
}

export const layerSheets = (id: string) => descendants(global.stage).filter(actor => actor.name === `extension-layer:${id}`);

export const developmentFolder = (id: string) => GLib.build_filenamev([GLib.getenv('KESTREL_DEVELOPMENT_EXTENSIONS')!, id]);

export const ownFolder = (id: string) => GLib.build_filenamev([GLib.get_user_data_dir(), 'luft', 'extensions', id]);

export const storeFolder = (id: string) => GLib.build_filenamev([GLib.getenv('KESTREL_STORE_EXTENSIONS')!, id]);

export function copyFolder(from: Gio.File, to: Gio.File) {
  GLib.mkdir_with_parents(to.get_path()!, 0o755);
  const children = from.enumerate_children('standard::name,standard::type', Gio.FileQueryInfoFlags.NONE, null);
  for (let info = children.next_file(null); info; info = children.next_file(null)) {
    const source = from.get_child(info.get_name());
    const target = to.get_child(info.get_name());
    if (info.get_file_type() === Gio.FileType.DIRECTORY) copyFolder(source, target);
    else source.copy(target, Gio.FileCopyFlags.OVERWRITE, null, null);
  }
}

export function install(name: string, id: string, folder = developmentFolder) {
  copyFolder(Gio.File.new_for_path(fixture('extensions', name)), Gio.File.new_for_path(folder(id)));
}

export async function installBuilt(id: string) {
  copyFolder(Gio.File.new_for_path(builtExtension(id)), Gio.File.new_for_path(developmentFolder(id)));
  await request('Reload', id);
}

export function rewrite(path: string, change: (text: string) => string) {
  const [, contents] = GLib.file_get_contents(path);
  GLib.file_set_contents(path, change(new TextDecoder().decode(contents)));
}

export function removeFolder(folder: Gio.File) {
  if (folder.query_file_type(Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null) === Gio.FileType.DIRECTORY) {
    const children = folder.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
    for (let info = children.next_file(null); info; info = children.next_file(null)) removeFolder(folder.get_child(info.get_name()));
  }
  folder.delete(null);
}
