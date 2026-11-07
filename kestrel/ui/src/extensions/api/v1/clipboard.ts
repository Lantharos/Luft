import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import type { ApiContext } from './context.js';
import type { Clipboard } from './types.js';

Gio._promisify(Gio.File.prototype, 'load_contents_async');

const IMAGES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

function imageType(path: string): string {
  const type = IMAGES[path.slice(path.lastIndexOf('.') + 1).toLowerCase()];
  if (!type) throw new Error(`${path} isn't a PNG, JPEG, WebP or GIF picture`);
  return type;
}

function fullPath(path: string): string {
  if (!GLib.path_is_absolute(path)) throw new Error(`${path} isn't a full path`);
  return path;
}

const copy = (type: string, contents: Uint8Array) => St.Clipboard.get_default().set_content(St.ClipboardType.CLIPBOARD, type, new GLib.Bytes(contents));

export function clipboardApi(_context: ApiContext): Clipboard {
  return {
    setText: text => St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, text),
    setImage: async path => {
      const type = imageType(fullPath(path));
      const [contents] = await Gio.File.new_for_path(path).load_contents_async(null);
      copy(type, contents);
    },
    setFiles: paths => copy('text/uri-list', new TextEncoder().encode(paths.map(path => `${GLib.filename_to_uri(fullPath(path), null)}\r\n`).join(''))),
  };
}
