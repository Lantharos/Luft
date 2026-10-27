import type Cogl from 'gi://Cogl';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

declare module '@girs/gio-2.0/gio-2.0' {
  namespace Gio {
    interface File {
      move_async(destination: File, flags: FileCopyFlags, ioPriority: number, cancellable: Cancellable | null, progress: null): Promise<boolean>;
    }
  }
}

Gio._promisify(Shell, 'texture_file_load_async');
Gio._promisify(Gio.File.prototype, 'replace_contents_bytes_async', 'replace_contents_finish');
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'delete_async');
Gio._promisify(Gio.File.prototype, 'move_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const STORE = Gio.File.new_for_path(GLib.build_filenamev([GLib.get_user_cache_dir(), 'kestrel', 'backgrounds']));
const SOURCE_ATTRIBUTES = 'time::modified,time::modified-usec,standard::size';
const ENUMERATED_FILES = 32;
const STORE_DELAY = 1500;

const used = new Set<string>();
const pending = new Set<string>();

export interface StoredBackground {
  texture: Cogl.Texture;
  metadata: Uint8Array;
}

function storedFile(key: string): Gio.File {
  const name = GLib.compute_checksum_for_string(GLib.ChecksumType.SHA256, key, -1)!;
  used.add(name);
  return STORE.get_child(name);
}

export async function identify(file: Gio.File, cancellable: Gio.Cancellable | null): Promise<string> {
  const info = await file.query_info_async(SOURCE_ATTRIBUTES, Gio.FileQueryInfoFlags.NONE, GLib.PRIORITY_DEFAULT, cancellable);
  return `${file.get_uri()} ${info.get_modification_date_time()!.to_unix_usec()} ${info.get_size()}`;
}

export function has(key: string): boolean {
  return pending.has(key) || storedFile(key).query_exists(null);
}

export async function load(key: string, priority: number, cancellable: Gio.Cancellable | null): Promise<StoredBackground | null> {
  try {
    const [texture, metadata] = await Shell.texture_file_load_async(storedFile(key), priority, cancellable);
    return { texture, metadata: metadata.toArray() };
  } catch (error) {
    if (!(error as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND) &&
      !(error as GLib.Error).matches(Gio.IOErrorEnum, Gio.IOErrorEnum.CANCELLED))
      console.warn(`Could not read a stored background: ${(error as Error).message}`);
    return null;
  }
}

async function prune(): Promise<void> {
  const children = await STORE.enumerate_children_async(Gio.FILE_ATTRIBUTE_STANDARD_NAME,
    Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_LOW, null);
  for (let infos; (infos = await children.next_files_async(ENUMERATED_FILES, GLib.PRIORITY_LOW, null)).length;) {
    await Promise.all(infos.filter(info => !used.has(info.get_name()))
      .map(info => STORE.get_child(info.get_name()).delete_async(GLib.PRIORITY_LOW, null)));
  }
}

async function write(key: string, texture: Cogl.Texture, metadata: Uint8Array): Promise<void> {
  const contents = Shell.texture_file_encode(texture, new GLib.Bytes(metadata));
  GLib.mkdir_with_parents(STORE.get_path()!, 0o700);
  const file = storedFile(key);
  const partial = STORE.get_child(`${file.get_basename()}.partial`);
  const partialName = partial.get_basename()!;
  used.add(partialName);
  try {
    await partial.replace_contents_bytes_async(contents, null, false,
      Gio.FileCreateFlags.REPLACE_DESTINATION | Gio.FileCreateFlags.PRIVATE, null);
    await partial.move_async(file, Gio.FileCopyFlags.OVERWRITE, GLib.PRIORITY_LOW, null, null);
  } finally {
    used.delete(partialName);
  }
  await prune();
}

export function store(key: string, render: () => Cogl.Texture | null, metadata: Uint8Array = new Uint8Array()): void {
  if (pending.has(key)) return;
  pending.add(key);
  GLib.timeout_add_once(GLib.PRIORITY_LOW, STORE_DELAY, async () => {
    try {
      const texture = render();
      if (texture) await write(key, texture, metadata);
    } catch (error) {
      console.warn(`Could not store a background: ${(error as Error).message}`);
    } finally {
      pending.delete(key);
    }
  });
}
