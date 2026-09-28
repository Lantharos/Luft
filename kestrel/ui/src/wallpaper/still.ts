import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { RENDERER } from './renderer.js';

const STILLS = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_data_dir(), 'kestrel', 'wallpapers']));

function stillFor(uri: string): Gio.File {
  return STILLS.get_child(`${GLib.compute_checksum_for_string(GLib.ChecksumType.SHA1, uri, -1)}.jpg`);
}

export function stillUri(uri: string): string {
  return stillFor(uri).get_uri();
}

function extract(uri: string, still: Gio.File): Promise<boolean> {
  GLib.mkdir_with_parents(STILLS.get_path()!, 0o755);
  const extractor = Gio.Subprocess.new([RENDERER, '--still', uri, still.get_path()!], Gio.SubprocessFlags.NONE);
  return new Promise(resolve => extractor.wait_check_async(null, (process, result) => {
    try {
      resolve(process!.wait_check_finish(result));
    } catch (error) {
      console.warn(`Could not take a still from ${uri}: ${error}`);
      resolve(false);
    }
  }));
}

function removeStillsExcept(kept: Gio.File): void {
  const children = STILLS.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);
  for (const info of children) {
    const child = STILLS.get_child(info.get_name());
    if (!child.equal(kept)) child.delete(null);
  }
}

export async function showStill(uri: string, background: Gio.Settings, current: () => boolean): Promise<void> {
  const still = stillFor(uri);
  if (!still.query_exists(null) && !(await extract(uri, still))) return;
  if (!current()) return;
  removeStillsExcept(still);
  for (const key of ['picture-uri', 'picture-uri-dark']) {
    if (background.get_string(key) !== still.get_uri()) background.set_string(key, still.get_uri());
  }
}
