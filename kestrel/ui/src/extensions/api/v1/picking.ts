import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import type GObject from 'gi://GObject';

import { extensionFile } from './audio/files.js';
import { removeTree } from '../../runtime/folders.js';
import type { ApiContext } from './context.js';
import type { ChooseOptions, PickOptions, SaveOptions } from './types.js';

const PORTAL = 'org.freedesktop.portal.Desktop';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const CHOOSER = 'org.freedesktop.portal.FileChooser';
const REQUEST = 'org.freedesktop.portal.Request';
const PICKED = 'picked';
const MOST_FOLDER_FILES = 32;
const LISTED_AT_ONCE = 64;
const LARGEST_FOLDER_FILE = 8 * 1024 * 1024;

const KINDS: Record<Exclude<PickOptions['kind'], 'folder'>, string[]> = {
  images: ['image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/jpeg'],
  sounds: ['audio/ogg', 'audio/flac', 'audio/x-wav', 'audio/wav', 'audio/mpeg'],
  calendars: ['text/calendar'],
};

Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

let requests = 0;

const string = (value: string) => GLib.Variant.new_string(value);

export function askFileChooser(method: 'OpenFile' | 'SaveFile', title: string, options: Record<string, GLib.Variant>): Promise<string[]> {
  const bus = Gio.DBus.session;
  const token = `kestrel_extension_${++requests}`;
  const sender = bus.get_unique_name()!.slice(1).replaceAll('.', '_');
  const request = `${PORTAL_PATH}/request/${sender}/${token}`;
  return new Promise((resolve, reject) => {
    const subscription = bus.signal_subscribe(PORTAL, REQUEST, 'Response', request, null, Gio.DBusSignalFlags.NONE,
      (_connection, _sender, _path, _iface, _signal, parameters) => {
        bus.signal_unsubscribe(subscription);
        const [response, results] = parameters.recursiveUnpack() as [number, { uris?: string[] }];
        resolve(response === 0 ? results.uris ?? [] : []);
      });
    const chooserOptions = { handle_token: string(token), modal: GLib.Variant.new_boolean(true), ...options };
    bus.call(PORTAL, PORTAL_PATH, CHOOSER, method, new GLib.Variant('(ssa{sv})', ['', title, chooserOptions]),
      null, Gio.DBusCallFlags.NONE, -1, null, (_bus, result) => {
        try {
          bus.call_finish(result);
        } catch (error) {
          bus.signal_unsubscribe(subscription);
          reject(error);
        }
      });
  });
}

function chosen(options: PickOptions): Promise<string[]> {
  return askFileChooser('OpenFile', options.title, {
    multiple: GLib.Variant.new_boolean(!!options.multiple),
    ...options.kind === 'folder'
      ? { directory: GLib.Variant.new_boolean(true) }
      : { filters: new GLib.Variant('a(sa(us))', [[options.title, KINDS[options.kind].map((type): [number, string] => [1, type])]]) },
  });
}

function copy(source: Gio.File, target: Gio.File): Promise<void> {
  return new Promise((resolve, reject) => source.copy_async(target, Gio.FileCopyFlags.NONE, GLib.PRIORITY_DEFAULT, null, null,
    ((_source: Gio.File, result: Gio.AsyncResult) => {
      try {
        source.copy_finish(result);
        resolve();
      } catch (error) {
        reject(error);
      }
    }) as unknown as GObject.Closure));
}

async function copyIn(uri: string, folder: string): Promise<string> {
  const source = Gio.File.new_for_uri(uri);
  const name = source.get_basename() ?? 'file';
  const dot = name.lastIndexOf('.');
  const target = GLib.build_filenamev([folder, `${GLib.uuid_string_random()}${dot > 0 ? name.slice(dot).toLowerCase() : ''}`]);
  await copy(source, Gio.File.new_for_path(target));
  return target;
}

async function regularFiles(folder: Gio.File): Promise<Gio.File[]> {
  const children = await folder.enumerate_children_async('standard::name,standard::type,standard::size', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);
  const files: Gio.File[] = [];
  for (let batch = await children.next_files_async(LISTED_AT_ONCE, GLib.PRIORITY_DEFAULT, null); batch.length && files.length < MOST_FOLDER_FILES; batch = await children.next_files_async(LISTED_AT_ONCE, GLib.PRIORITY_DEFAULT, null)) {
    for (const info of batch) {
      if (info.get_file_type() !== Gio.FileType.REGULAR || info.get_size() > LARGEST_FOLDER_FILE) continue;
      files.push(folder.get_child(info.get_name()));
    }
  }
  return files.slice(0, MOST_FOLDER_FILES);
}

async function copyFolderIn(uri: string, folder: string): Promise<string> {
  const source = Gio.File.new_for_uri(uri);
  const target = Gio.File.new_for_path(GLib.build_filenamev([folder, GLib.uuid_string_random()]));
  target.make_directory(null);
  for (const file of await regularFiles(source)) await copy(file, target.get_child(file.get_basename()!));
  return target.get_path()!;
}

export function deleteFile(context: ApiContext, path: string): void {
  const file = extensionFile([context.dataPath], path);
  if (file.equal(Gio.File.new_for_path(context.dataPath))) throw new Error("The data folder itself can't be deleted");
  removeTree(file);
}

export function readText(context: ApiContext, path: string): string | null {
  const file = extensionFile([context.path, context.dataPath], path);
  if (!file.query_exists(null)) return null;
  return new TextDecoder().decode(file.load_contents(null)[1]);
}

/** Lets people pick files through the file chooser, and keeps copies of them in the extension's data folder. */
export async function pickFiles(context: ApiContext, options: PickOptions): Promise<string[]> {
  if (!context.gestures.recent) throw new Error('Files can only be picked right after people use the extension');
  const uris = await chosen(options);
  const folder = GLib.build_filenamev([context.dataPath, PICKED]);
  GLib.mkdir_with_parents(folder, 0o700);
  const copyPicked = options.kind === 'folder' ? copyFolderIn : copyIn;
  const copies: string[] = [];
  for (const uri of uris) copies.push(await copyPicked(uri, folder));
  return copies;
}

/** Lets people choose files or a folder with the file chooser, and returns where they are. */
export async function chooseFiles(context: ApiContext, options: ChooseOptions): Promise<string[]> {
  if (!context.gestures.recent) throw new Error('Files can only be chosen right after people use the extension');
  const uris = await askFileChooser('OpenFile', options.title, {
    multiple: GLib.Variant.new_boolean(!!options.multiple),
    directory: GLib.Variant.new_boolean(!!options.folder),
  });
  return uris.map(uri => Gio.File.new_for_uri(uri).get_path()).filter((path): path is string => path !== null);
}

function replaceFile(file: Gio.File, text: string): Promise<unknown> {
  const contents = new GLib.Bytes(new TextEncoder().encode(text));
  return file.replace_contents_bytes_async(contents, null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null);
}

export function writeText(context: ApiContext, path: string, text: string): Promise<unknown> {
  GLib.mkdir_with_parents(context.dataPath, 0o700);
  return replaceFile(extensionFile([context.dataPath], path), text);
}

/** Asks where to save a text file and writes it there. */
export async function saveFile(context: ApiContext, options: SaveOptions): Promise<boolean> {
  if (!context.gestures.recent) throw new Error('Files can only be saved right after people use the extension');
  const [uri] = await askFileChooser('SaveFile', options.title, { current_name: string(options.name) });
  if (!uri) return false;
  await replaceFile(Gio.File.new_for_uri(uri), options.text);
  return true;
}
