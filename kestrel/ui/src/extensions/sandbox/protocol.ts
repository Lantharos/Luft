import type { Manifest, SettingValue, Stored } from '../api/v1/types.js';

export interface Init {
  t: 'init';
  manifest: Manifest;
  name: string;
  path: string;
  dataPath: string;
  locale: string;
  stored: Record<string, Stored>;
  settings: Record<string, SettingValue>;
  mirrors: Record<string, unknown>;
}

export type ToHost =
  | Init
  | { t: 'mirror'; area: string; value: unknown }
  | { t: 'setting'; key: string; value: SettingValue }
  | { t: 'ref'; ref: number; state: Record<string, unknown> }
  | { t: 'invoke'; id: number; fn: number; args: unknown[] }
  | { t: 'reply'; id: number; value?: unknown; error?: string }
  | { t: 'disable' };

export type FromHost =
  | { t: 'ready' }
  | { t: 'call'; path: string; args: unknown[]; id?: number; ref?: number }
  | { t: 'method'; target: number; name: string; args: unknown[]; id?: number; ref?: number }
  | { t: 'done'; id: number; pending?: boolean; value?: unknown; error?: string }
  | { t: 'settled'; id: number; value?: unknown; error?: string }
  | { t: 'failed'; error: string };

export interface EncodedFunction {
  $fn: number;
}

export interface EncodedRef {
  $ref: number;
}

export const isEncodedFunction = (value: unknown): value is EncodedFunction =>
  typeof value === 'object' && value !== null && typeof (value as EncodedFunction).$fn === 'number';

export const isEncodedRef = (value: unknown): value is EncodedRef =>
  typeof value === 'object' && value !== null && typeof (value as EncodedRef).$ref === 'number';
