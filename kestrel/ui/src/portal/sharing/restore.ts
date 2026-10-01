import GLib from 'gi://GLib';

import { option, type Options } from '../core/request.js';

export const DONT_PERSIST = 0;
export const PERSIST_WHILE_RUNNING = 1;
export const PERSIST_UNTIL_REVOKED = 2;

const PROVIDER = 'Kestrel';
const FORMAT = 1;

export interface StoredChoice<T extends unknown[]> {
  readonly created: number;
  readonly values: T;
}

export function persistMode(options: Options): number {
  return Math.min(option<number>(options, 'persist_mode') ?? DONT_PERSIST, PERSIST_UNTIL_REVOKED);
}

export function storedChoice<T extends unknown[]>(options: Options, signature: string): StoredChoice<T> | null {
  const data = options.restore_data;
  if (data?.get_type_string() !== '(suv)') return null;
  const [provider, format, choice] = data.deep_unpack() as [string, number, GLib.Variant];
  if (provider !== PROVIDER || format !== FORMAT || choice.get_type_string() !== `(xx${signature})`) return null;
  const [created, , ...values] = choice.deep_unpack() as [number, number, ...T];
  return { created, values: values as T };
}

export function persisted(mode: number, signature: string, created: number | undefined, values: unknown[]): Options {
  if (mode === DONT_PERSIST) return {};
  const now = GLib.get_real_time();
  const choice: string = `(xx${signature})`;
  return {
    persist_mode: new GLib.Variant('u', mode),
    restore_data: new GLib.Variant('(suv)', [PROVIDER, FORMAT, new GLib.Variant(choice, [created ?? now, now, ...values])]),
  };
}
