import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

const MAX_LINKS = 40;

export function realPath(path: string): string {
  const pending = GLib.canonicalize_filename(path, null).split('/').filter(Boolean);
  let resolved = '/';
  for (let links = 0; pending.length;) {
    const next = GLib.build_filenamev([resolved, pending.shift()!]);
    if (!GLib.file_test(next, GLib.FileTest.IS_SYMLINK)) {
      resolved = next;
      continue;
    }
    if (++links > MAX_LINKS) throw new Error(`${path} goes through too many links`);
    pending.unshift(...GLib.canonicalize_filename(GLib.file_read_link(next), resolved).split('/').filter(Boolean));
    resolved = '/';
  }
  return resolved;
}

const within = (path: string, folder: string) => path === folder || path.startsWith(folder.endsWith('/') ? folder : `${folder}/`);

export function confinedPath(folders: readonly string[], path: string): string {
  const real = realPath(GLib.path_is_absolute(path) ? path : GLib.build_filenamev([folders[0], path]));
  if (!folders.some(folder => within(real, realPath(folder)))) throw new Error(`${path} is outside the extension's folders`);
  return real;
}

export function confinedFile(folders: readonly string[], path: string): Gio.File {
  return Gio.File.new_for_path(confinedPath(folders, path));
}

export function reachableFolders({ path, dataPath, chosen }: { path: string; dataPath: string; chosen: ReadonlySet<string> }): string[] {
  return [path, dataPath, ...chosen];
}
