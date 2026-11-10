import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Meta from 'gi://Meta';

import { missing, removeFile } from '../../appearance/files.js';

Gio._promisify(Gio.File.prototype, 'load_bytes_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');
Gio._promisify(Gio.OutputStream.prototype, 'close_async');
Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');
Gio._promisify(Meta.Selection.prototype, 'transfer_async');

const BATCH_SIZE = 32;

async function receivedBytes(selection: Meta.Selection, mimeType: string, most: number, stream: Gio.FileOutputStream): Promise<number> {
  try {
    await selection.transfer_async(Meta.SelectionType.SELECTION_CLIPBOARD, mimeType, most, stream, null);
    return stream.tell();
  } catch (error) {
    if (error instanceof GLib.Error) return 0;
    throw error;
  }
}

export class ClipboardImageFiles {
  private readonly directory = Gio.File.new_for_path(
    GLib.build_filenamev([GLib.get_user_runtime_dir(), 'kestrel', GLib.getenv('WAYLAND_DISPLAY')!, 'clipboard']));
  private readonly ownPrefix = `${GLib.uuid_string_random()}-`;

  constructor() {
    void this.emptyLeftovers();
  }

  async receive(selection: Meta.Selection, mimeType: string, copied: number, byteLimit: number): Promise<Gio.File | null> {
    GLib.mkdir_with_parents(this.directory.get_path()!, 0o700);
    const file = this.directory.get_child(`${this.ownPrefix}${copied}`);
    const stream = file.create(Gio.FileCreateFlags.PRIVATE, null);
    const size = await receivedBytes(selection, mimeType, byteLimit + 1, stream);
    await stream.close_async(GLib.PRIORITY_DEFAULT, null);
    if (size > 0 && size <= byteLimit) return file;
    this.discard(file);
    return null;
  }

  async checksum(file: Gio.File): Promise<string> {
    const hashing = Gio.Subprocess.new(['sha256sum', file.get_path()!], Gio.SubprocessFlags.STDOUT_PIPE);
    const [output] = await hashing.communicate_utf8_async(null, null);
    return output.slice(0, output.indexOf(' '));
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
      await Promise.all(batch.filter(info => !info.get_name().startsWith(this.ownPrefix)).map(info => removeFile(children.get_child(info))));
  }
}
