import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { missing, removeFile } from '../appearance/files.js';

Gio._promisify(Gio.File.prototype, 'load_bytes_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const BATCH_SIZE = 32;

export class ClipboardImageFiles {
  private readonly directory = Gio.File.new_for_path(
    GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, 'clipboard']));
  private readonly emptied = this.emptyLeftovers();

  async save(id: string, bytes: GLib.Bytes): Promise<Gio.File> {
    await this.emptied;
    GLib.mkdir_with_parents(this.directory.get_path()!, 0o700);
    const file = this.directory.get_child(id);
    await file.replace_contents_bytes_async(bytes, null, false, Gio.FileCreateFlags.PRIVATE, null);
    return file;
  }

  async load(file: Gio.File): Promise<GLib.Bytes> {
    const [bytes] = await file.load_bytes_async(null);
    return bytes;
  }

  discard(file: Gio.File): void {
    void removeFile(file);
  }

  private async emptyLeftovers(): Promise<void> {
    let children: Gio.FileEnumerator;
    try {
      children = await this.directory.enumerate_children_async(Gio.FILE_ATTRIBUTE_STANDARD_NAME,
        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_LOW, null);
    } catch (error) {
      if (missing(error)) return;
      throw error;
    }
    let batch: Gio.FileInfo[];
    while ((batch = await children.next_files_async(BATCH_SIZE, GLib.PRIORITY_LOW, null)).length)
      await Promise.all(batch.map(info => removeFile(children.get_child(info))));
  }
}
