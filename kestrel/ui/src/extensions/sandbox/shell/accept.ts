import type { Stored } from '../../api/v1/types.js';
import { isEncodedFunction, isEncodedRef } from '../protocol.js';

const DEEPEST = 24;

export type Stub = (...args: unknown[]) => Promise<unknown>;

export interface Decoding {
  stub(id: number, result: Accept<unknown> | null): Stub;
  ref(id: number, kinds: readonly string[]): object;
  budget: number;
  depth: number;
}

export type Accept<Value> = ((value: unknown, where: string, decoding: Decoding) => Value) & { optional?: true };

export class Refused extends Error {}

function refuse(where: string, what: string): never {
  throw new Refused(`${where} must be ${what}`);
}

function spend(decoding: Decoding, where: string): void {
  if (--decoding.budget < 0) refuse(where, 'smaller');
}

function nested<Value>(decoding: Decoding, where: string, decode: () => Value): Value {
  if (++decoding.depth > DEEPEST) refuse(where, `at most ${DEEPEST} levels deep`);
  try {
    return decode();
  } finally {
    decoding.depth--;
  }
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const text = (longest = 1000): Accept<string> => (value, where, decoding) => {
  spend(decoding, where);
  if (typeof value !== 'string' || value.length > longest) refuse(where, `text of at most ${longest} characters`);
  return value;
};

export const number = (least = -Number.MAX_VALUE, most = Number.MAX_VALUE): Accept<number> => (value, where, decoding) => {
  spend(decoding, where);
  if (typeof value !== 'number' || !Number.isFinite(value) || value < least || value > most) refuse(where, `a number from ${least} to ${most}`);
  return value;
};

export const flag: Accept<boolean> = (value, where, decoding) => {
  spend(decoding, where);
  if (typeof value !== 'boolean') refuse(where, 'true or false');
  return value;
};

export const literal = <Value extends string>(...values: Value[]): Accept<Value> => (value, where, decoding) => {
  spend(decoding, where);
  if (!values.includes(value as Value)) refuse(where, `one of ${values.join(', ')}`);
  return value as Value;
};

export function optional<Value>(accept: Accept<Value>): Accept<Value | undefined> {
  const decode: Accept<Value | undefined> = (value, where, decoding) => value === undefined ? undefined : accept(value, where, decoding);
  decode.optional = true;
  return decode;
}

export const nullable = <Value>(accept: Accept<Value>): Accept<Value | null> =>
  optional((value, where, decoding) => value === null ? null : accept(value, where, decoding)) as Accept<Value | null>;

export const list = <Value>(accept: Accept<Value>, most: number): Accept<Value[]> => (value, where, decoding) => {
  spend(decoding, where);
  if (!Array.isArray(value) || value.length > most) refuse(where, `a list of at most ${most}`);
  return nested(decoding, where, () => value.map((item, index) => accept(item, `${where}[${index}]`, decoding)));
};

export const keyed = <Value>(accept: Accept<Value>, most: number): Accept<Record<string, Value>> => (value, where, decoding) => {
  spend(decoding, where);
  if (!isPlainObject(value) || Object.keys(value).length > most) refuse(where, `a table of at most ${most}`);
  return nested(decoding, where, () => Object.fromEntries(Object.entries(value).map(([key, item]) => [text()(key, where, decoding), accept(item, `${where}.${key}`, decoding)])));
};

type Shape = Record<string, Accept<unknown>>;
type Shaped<Fields extends Shape> = { [Key in keyof Fields]: ReturnType<Fields[Key]> };

export const shape = <Fields extends Shape>(fields: Fields): Accept<Shaped<Fields>> => (value, where, decoding) => {
  spend(decoding, where);
  if (!isPlainObject(value)) refuse(where, 'a table');
  return nested(decoding, where, () => {
    const decoded: Record<string, unknown> = {};
    for (const [key, accept] of Object.entries(fields)) {
      if (accept.optional && value[key] === undefined) continue;
      decoded[key] = accept(value[key], `${where}.${key}`, decoding);
    }
    return decoded as Shaped<Fields>;
  });
};

function clearable<Value>(accept: Accept<Value>): Accept<Value | undefined> {
  return optional((value, where, decoding) => value === null ? undefined : accept(value, where, decoding));
}

export function partial<Fields extends Shape>(fields: Fields): Accept<Partial<Shaped<Fields>>> {
  return shape(Object.fromEntries(Object.entries(fields).map(([key, accept]) => [key, clearable(accept)]))) as Accept<Partial<Shaped<Fields>>>;
}

export const fn = (result: Accept<unknown> | null = null): Accept<Stub> => (value, where, decoding) => {
  spend(decoding, where);
  if (!isEncodedFunction(value) || !Number.isSafeInteger(value.$fn)) refuse(where, 'a function');
  return decoding.stub(value.$fn, result);
};

export const ref = (...kinds: string[]): Accept<object> => (value, where, decoding) => {
  spend(decoding, where);
  if (!isEncodedRef(value)) refuse(where, `one of its ${kinds.join(' or ')}s`);
  return decoding.ref(value.$ref, kinds);
};

export const either = <Value>(...accepts: Accept<Value>[]): Accept<Value> => (value, where, decoding) => {
  const refusals: string[] = [];
  for (const accept of accepts) {
    try {
      return accept(value, where, decoding);
    } catch (error) {
      if (!(error instanceof Refused)) throw error;
      refusals.push(error.message);
    }
  }
  throw new Refused(refusals.join(', or '));
};

export const stored: Accept<Stored> = (value, where, decoding) => {
  spend(decoding, where);
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : refuse(where, 'a finite number');
  return nested(decoding, where, () => {
    if (Array.isArray(value)) return value.map((item, index) => stored(item, `${where}[${index}]`, decoding));
    if (!isPlainObject(value)) refuse(where, 'what JSON can hold');
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stored(item, `${where}.${key}`, decoding)]));
  });
};

export const tree: Accept<unknown> = (value, where, decoding) => {
  if (isEncodedFunction(value)) return fn()(value, where, decoding);
  spend(decoding, where);
  if (typeof value !== 'object' || value === null) return value;
  return nested(decoding, where, () => Array.isArray(value)
    ? value.map((item, index) => tree(item, `${where}[${index}]`, decoding))
    : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, tree(item, `${where}.${key}`, decoding)])));
};
