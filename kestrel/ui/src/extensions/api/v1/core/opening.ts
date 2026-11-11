import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { openUriAsync } from '../../../../shared/apps/launch.js';
import type { ApiContext } from './context.js';
import { confinedPath, reachableFolders } from './confined.js';

const LINKS = new Set(['https', 'mailto', 'schelf']);
const RUNNABLE = ['application/x-executable', 'application/x-sharedlib', 'application/x-shellscript', 'application/x-desktop', 'application/vnd.appimage'];
const RUNS_AS_PROGRAM = 0o111;

function refuseRunnable(path: string): void {
  const info = Gio.File.new_for_path(path).query_info('standard::type,standard::content-type,unix::mode', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
  if (info.get_file_type() === Gio.FileType.DIRECTORY) return;
  const type = info.get_content_type() ?? '';
  if (info.get_file_type() !== Gio.FileType.REGULAR || info.get_attribute_uint32('unix::mode') & RUNS_AS_PROGRAM || RUNNABLE.some(runnable => Gio.content_type_is_a(type, runnable)))
    throw new Error(`${path} is a program or launcher, which extensions can't open`);
}

function openable(context: ApiContext, uri: string): string {
  const scheme = GLib.uri_peek_scheme(uri);
  if (scheme && LINKS.has(scheme)) return uri;
  if (scheme !== 'file') throw new Error(`${uri} isn't a web link, an email address or a file`);
  const path = Gio.File.new_for_uri(uri).get_path();
  if (!path) throw new Error(`${uri} isn't a file`);
  const real = confinedPath(reachableFolders(context), path);
  refuseRunnable(real);
  return GLib.filename_to_uri(real, null);
}

export function opener(context: ApiContext): (uri: string) => void {
  return uri => {
    const target = openable(context, uri);
    openUriAsync(target).catch(error => console.warn(`${uri} could not be opened: ${error}`));
  };
}
