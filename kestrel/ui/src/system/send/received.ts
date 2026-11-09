import Gio from 'gi://Gio';
import GioUnix from 'gi://GioUnix';
import GLib from 'gi://GLib';

Gio._promisify(Gio.File.prototype, 'create_async');
Gio._promisify(Gio.File.prototype, 'delete_async');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');
Gio._promisify(Gio.InputStream.prototype, 'read_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'write_bytes_async');
Gio._promisify(Gio.OutputStream.prototype, 'close_async');

export const MOST_FILES = 32;
export const MOST_BYTES = 2 * 1024 ** 3;
const CHUNK = 1024 ** 2;
const LONGEST_NAME = 255;
const KEPT_FOR = GLib.TIME_SPAN_DAY;
const BATCH = 64;
const FOLDER = GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'sent']);

/** A file an app handed over, copied where the devices and apps it goes to can read it. */
export interface Received {
  readonly path: string;
  readonly name: string;
  readonly contentType: string;
}

export interface Handed {
  readonly fd: number;
  readonly name: string;
}

const acceptableName = (name: string) =>
  !!name && name !== '.' && name !== '..' && !name.includes('/') && new TextEncoder().encode(name).length <= LONGEST_NAME;

/** The size of what an fd points at, when it's a regular file. Pipes, sockets and devices have none. */
function regularSize(fd: number): number | null {
  const info = Gio.File.new_for_path(`/proc/self/fd/${fd}`).query_info('standard::type,standard::size', Gio.FileQueryInfoFlags.NONE, null);
  return info.get_file_type() === Gio.FileType.REGULAR ? info.get_size() : null;
}

/** Checks every file before reading any: plain names, regular files, and no more than Kestrel takes in one go. */
export function check(handed: Handed[]): number[] {
  if (!handed.length) throw new Error('There are no files to send');
  if (handed.length > MOST_FILES) throw new Error(`At most ${MOST_FILES} files can be sent at once`);
  const sizes = handed.map(({ fd, name }) => {
    if (!acceptableName(name)) throw new Error(`${name} isn't a file name`);
    const size = regularSize(fd);
    if (size === null) throw new Error(`${name} isn't a regular file`);
    return size;
  });
  if (sizes.reduce((total, size) => total + size, 0) > MOST_BYTES) throw new Error('The files are too large to send');
  return sizes;
}

async function copy({ fd, name }: Handed, size: number): Promise<Received> {
  const folder = Gio.File.new_for_path(GLib.build_filenamev([FOLDER, GLib.uuid_string_random()]));
  const target = folder.get_child(name);
  const input = new GioUnix.InputStream({ fd, close_fd: true });
  let contentType: string | null = null;
  let copied = 0;
  try {
    folder.make_directory(null);
    const output = await target.create_async(Gio.FileCreateFlags.PRIVATE, GLib.PRIORITY_DEFAULT, null);
    for (;;) {
      const chunk = await input.read_bytes_async(CHUNK, GLib.PRIORITY_DEFAULT, null);
      const length = chunk.get_size();
      if (!length) break;
      copied += length;
      if (copied > size) throw new Error(`${name} grew while it was being read`);
      contentType ??= Gio.content_type_guess(name, chunk.toArray())[0];
      await output.write_bytes_async(chunk, GLib.PRIORITY_DEFAULT, null);
    }
    await output.close_async(GLib.PRIORITY_DEFAULT, null);
  } catch (error) {
    await remove(folder).catch(logError);
    throw error;
  } finally {
    input.close(null);
  }
  return { path: target.get_path()!, name, contentType: contentType ?? Gio.content_type_guess(name, null)[0] };
}

/** Copies what an app handed over. The fds are closed either way. */
export async function receive(handed: Handed[]): Promise<Received[]> {
  let sizes: number[];
  try {
    sizes = check(handed);
  } catch (error) {
    for (const { fd } of handed) GLib.close(fd);
    throw error;
  }
  GLib.mkdir_with_parents(FOLDER, 0o700);
  void sweep();
  const copies = handed.map((file, index) => copy(file, sizes[index]));
  const settled = await Promise.allSettled(copies);
  const copied = settled.flatMap(result => result.status === 'fulfilled' ? [result.value] : []);
  const failed = settled.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  if (!failed) return copied;
  await Promise.all(copied.map(file => remove(Gio.File.new_for_path(file.path).get_parent()!).catch(logError)));
  throw failed.reason;
}

async function remove(file: Gio.File): Promise<void> {
  const children = await file.enumerate_children_async('standard::name', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_LOW, null);
  for (let infos = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null); infos.length; infos = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null))
    for (const info of infos) await file.get_child(info.get_name()).delete_async(GLib.PRIORITY_LOW, null);
  await file.delete_async(GLib.PRIORITY_LOW, null);
}

/** Forgets copies older than a day, long enough for any device or app they went to to have taken them. */
export async function sweep(): Promise<void> {
  const folder = Gio.File.new_for_path(FOLDER);
  const oldest = GLib.DateTime.new_now_utc().add(-KEPT_FOR)!;
  try {
    const children = await folder.enumerate_children_async('standard::name,time::modified', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_LOW, null);
    for (let infos = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null); infos.length; infos = await children.next_files_async(BATCH, GLib.PRIORITY_LOW, null))
      for (const info of infos)
        if (info.get_modification_date_time()!.compare(oldest) < 0) await remove(folder.get_child(info.get_name())).catch(() => {});
  } catch (error) {
    if (!(error instanceof GLib.Error && error.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))) throw error;
  }
}
