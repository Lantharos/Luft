import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { option, type Options } from '../core/request.js';

export const DONT_PERSIST = 0;
export const PERSIST_UNTIL_REVOKED = 2;

const PROVIDER = 'Kestrel';
const FORMAT = 2;
const KEY_LENGTH = 32;
const KEY_FILE = GLib.build_filenamev([GLib.get_user_data_dir(), 'kestrel', 'portal-restore.key']);

export interface StoredChoice<T extends unknown[]> {
  readonly created: number;
  readonly values: T;
}

let key: GLib.Bytes | null = null;

function newKey(): GLib.Bytes {
  const stream = Gio.File.new_for_path('/dev/urandom').read(null);
  const bytes = stream.read_bytes(KEY_LENGTH, null);
  stream.close(null);
  GLib.mkdir_with_parents(GLib.path_get_dirname(KEY_FILE), 0o700);
  GLib.file_set_contents_full(KEY_FILE, bytes.toArray(), GLib.FileSetContentsFlags.CONSISTENT, 0o600);
  return bytes;
}

function restoreKey(): GLib.Bytes {
  if (key) return key;
  try {
    const [, contents] = GLib.file_get_contents(KEY_FILE);
    if (contents.length === KEY_LENGTH) key = new GLib.Bytes(contents);
  } catch {
    key = null;
  }
  key ??= newKey();
  return key;
}

function seal(appId: string, choice: GLib.Variant): string {
  return GLib.compute_hmac_for_bytes(GLib.ChecksumType.SHA256, restoreKey(), new GLib.Variant('(sv)', [appId, choice]).get_data_as_bytes());
}

function sameText(first: string, second: string): boolean {
  let difference = first.length ^ second.length;
  for (let index = 0; index < Math.min(first.length, second.length); index++) difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return difference === 0;
}

export function persistMode(options: Options): number {
  return Math.min(option<number>(options, 'persist_mode') ?? DONT_PERSIST, PERSIST_UNTIL_REVOKED);
}

export function storedChoice<T extends unknown[]>(options: Options, signature: string, appId: string): StoredChoice<T> | null {
  const data = options.restore_data;
  if (data?.get_type_string() !== '(suv)') return null;
  const [provider, format, sealed] = data.deep_unpack() as [string, number, GLib.Variant];
  if (provider !== PROVIDER || format !== FORMAT || sealed.get_type_string() !== '(sv)') return null;
  const [mac, choice] = sealed.deep_unpack() as [string, GLib.Variant];
  if (choice.get_type_string() !== `(xx${signature})` || !sameText(mac, seal(appId, choice))) return null;
  const [created, , ...values] = choice.deep_unpack() as [number, number, ...T];
  return { created, values: values as T };
}

export function persisted(mode: number, signature: string, appId: string, created: number | undefined, values: unknown[]): Options {
  if (mode === DONT_PERSIST) return {};
  const now = GLib.get_real_time();
  const type: string = `(xx${signature})`;
  const choice = new GLib.Variant(type, [created ?? now, now, ...values]);
  return {
    persist_mode: new GLib.Variant('u', mode),
    restore_data: new GLib.Variant('(suv)', [PROVIDER, FORMAT, new GLib.Variant('(sv)', [seal(appId, choice), choice])]),
  };
}
