import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { extensionFile } from './audio/files.js';
import type { ApiContext } from './context.js';
import type { PickOptions } from './types.js';

const PORTAL = 'org.freedesktop.portal.Desktop';
const PORTAL_PATH = '/org/freedesktop/portal/desktop';
const CHOOSER = 'org.freedesktop.portal.FileChooser';
const REQUEST = 'org.freedesktop.portal.Request';
const PICKED = 'picked';

const KINDS: Record<PickOptions['kind'], string[]> = {
  images: ['image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/jpeg'],
  sounds: ['audio/ogg', 'audio/flac', 'audio/x-wav', 'audio/wav', 'audio/mpeg'],
};

let requests = 0;

function chosen(title: string, options: PickOptions): Promise<string[]> {
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
    const chooserOptions = {
      handle_token: GLib.Variant.new_string(token),
      multiple: GLib.Variant.new_boolean(!!options.multiple),
      modal: GLib.Variant.new_boolean(true),
      filters: new GLib.Variant('a(sa(us))', [[title, KINDS[options.kind].map((type): [number, string] => [1, type])]]),
    };
    bus.call(PORTAL, PORTAL_PATH, CHOOSER, 'OpenFile', new GLib.Variant('(ssa{sv})', ['', title, chooserOptions]),
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

function copyIn(uri: string, folder: string): string {
  const source = Gio.File.new_for_uri(uri);
  const name = source.get_basename() ?? 'file';
  const dot = name.lastIndexOf('.');
  const target = GLib.build_filenamev([folder, `${GLib.uuid_string_random()}${dot > 0 ? name.slice(dot).toLowerCase() : ''}`]);
  source.copy(Gio.File.new_for_path(target), Gio.FileCopyFlags.NONE, null, null);
  return target;
}

export function deleteFile(context: ApiContext, path: string): void {
  const file = extensionFile([context.dataPath], path);
  if (file.equal(Gio.File.new_for_path(context.dataPath))) throw new Error("The data folder itself can't be deleted");
  file.delete(null);
}

/** Lets people pick files through the file chooser, and keeps copies of them in the extension's data folder. */
export async function pickFiles(context: ApiContext, options: PickOptions): Promise<string[]> {
  if (!context.gestures.recent) throw new Error('Files can only be picked right after people use the extension');
  const uris = await chosen(options.title, options);
  const folder = GLib.build_filenamev([context.dataPath, PICKED]);
  GLib.mkdir_with_parents(folder, 0o700);
  return uris.map(uri => copyIn(uri, folder));
}
