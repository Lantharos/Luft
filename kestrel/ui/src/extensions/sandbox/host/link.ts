import GioUnix from 'gi://GioUnix';

import type { Disposable } from '../../api/v1/types.js';
import { Channel } from '../channel.js';
import type { FromHost, Init, ToHost } from '../protocol.js';

const LIMITS = { longestLine: 64 * 1024 * 1024, mostQueued: 256 * 1024 * 1024 };
const KEPT_ANSWERS = 8;

type Callable = (...args: unknown[]) => unknown;

interface Waiting {
  resolve(value: unknown): void;
  reject(error: Error): void;
}

export interface LinkEvents {
  init(init: Init): void;
  disable(): void;
  setting(key: string, value: unknown): void;
}

export function describeError(error: unknown): string {
  if (error instanceof Error) console.warn(`${error.message}\n${error.stack ?? ''}`);
  return error instanceof Error ? error.message : String(error);
}

export class Link {
  private readonly channel: Channel;
  private readonly functions = new Map<number, Callable>();
  private readonly slots = new Map<string, number[]>();
  private readonly answers = new Map<number, string[]>();
  private readonly waiting = new Map<number, Waiting>();
  private readonly states = new Map<number, (state: Record<string, unknown>) => void>();
  private readonly mirrored = new Map<string, unknown>();
  private readonly mirrorListeners = new Map<string, Set<() => void>>();
  private readonly refIds = new WeakMap<object, number>();
  private nextFunction = 0;
  private nextRef = 0;
  private nextCall = 0;

  constructor(private readonly events: LinkEvents) {
    this.channel = new Channel(new GioUnix.InputStream({ fd: 0 }), new GioUnix.OutputStream({ fd: 1 }), LIMITS, {
      line: text => this.received(JSON.parse(text) as ToHost),
      closed: () => events.disable(),
    });
  }

  mirror<Value>(area: string): Value {
    return this.mirrored.get(area) as Value;
  }

  watchMirror(area: string, changed: () => void): () => void {
    const listeners = this.mirrorListeners.get(area) ?? new Set();
    this.mirrorListeners.set(area, listeners);
    listeners.add(changed);
    return () => listeners.delete(changed);
  }

  call(path: string, args: unknown[] = []): void {
    this.send({ t: 'call', path, args: this.encode(args, null) as unknown[] });
  }

  ask<Value>(path: string, args: unknown[] = []): Promise<Value> {
    const id = ++this.nextCall;
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.send({ t: 'call', path, args: this.encode(args, null) as unknown[], id });
    });
  }

  make(path: string, args: unknown[], state: (state: Record<string, unknown>) => void = () => {}): number {
    const ref = ++this.nextRef;
    this.states.set(ref, state);
    this.send({ t: 'call', path, args: this.encode(args, `${ref}`) as unknown[], ref });
    return ref;
  }

  adopt<Thing extends object>(ref: number, thing: Thing): Thing {
    this.refIds.set(thing, ref);
    return thing;
  }

  method(ref: number, name: string, args: unknown[] = [], slot = `${ref}.${name}`): void {
    this.free(slot);
    this.send({ t: 'method', target: ref, name, args: this.encode(args, slot) as unknown[] });
  }

  update(ref: number, changes: Record<string, unknown>): void {
    for (const key of Object.keys(changes)) this.free(`${ref}.${key}`);
    const encoded = Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, value === undefined ? null : this.encode(value, `${ref}.${key}`)]));
    this.send({ t: 'method', target: ref, name: 'update', args: [encoded] });
  }

  end(ref: number, name = 'dispose'): void {
    this.forget(ref);
    this.send({ t: 'method', target: ref, name, args: [] });
  }

  forget(ref: number): void {
    this.states.delete(ref);
    for (const slot of [...this.slots.keys()]) if (slot === `${ref}` || slot.startsWith(`${ref}.`)) this.free(slot);
  }

  ready(): void {
    this.send({ t: 'ready' });
  }

  failed(error: unknown): void {
    this.send({ t: 'failed', error: describeError(error) });
  }

  private send(message: FromHost): void {
    this.channel.send(message);
  }

  private encode(value: unknown, slot: string | null): unknown {
    if (typeof value === 'function') {
      if (slot === null) return undefined;
      const id = ++this.nextFunction;
      this.functions.set(id, value as Callable);
      const owned = this.slots.get(slot) ?? [];
      this.slots.set(slot, owned);
      owned.push(id);
      return { $fn: id };
    }
    if (typeof value !== 'object' || value === null) return value;
    const ref = this.refIds.get(value);
    if (ref !== undefined) return { $ref: ref };
    if (Array.isArray(value)) return value.map(item => this.encode(item, slot));
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.encode(item, slot)]));
  }

  private free(slot: string): void {
    for (const id of this.slots.get(slot) ?? []) {
      this.functions.delete(id);
      for (const key of this.answers.get(id) ?? []) this.free(`${id}:${key}`);
      this.answers.delete(id);
    }
    this.slots.delete(slot);
  }

  private answer(fn: number, args: unknown[], value: unknown): unknown {
    const key = JSON.stringify(args);
    const slot = `${fn}:${key}`;
    this.free(slot);
    const kept = (this.answers.get(fn) ?? []).filter(earlier => earlier !== key);
    kept.push(key);
    if (kept.length > KEPT_ANSWERS) this.free(`${fn}:${kept.shift()}`);
    this.answers.set(fn, kept);
    return this.encode(value, slot);
  }

  private received(message: ToHost): void {
    switch (message.t) {
      case 'init':
        for (const [area, value] of Object.entries(message.mirrors)) this.mirrored.set(area, value);
        return this.events.init(message);
      case 'mirror':
        this.mirrored.set(message.area, message.value);
        for (const listener of [...this.mirrorListeners.get(message.area) ?? []]) listener();
        return;
      case 'setting':
        return this.events.setting(message.key, message.value);
      case 'ref':
        return this.states.get(message.ref)?.(message.state);
      case 'invoke':
        return this.invoke(message.id, message.fn, message.args);
      case 'reply': {
        const waiting = this.waiting.get(message.id);
        this.waiting.delete(message.id);
        if (message.error !== undefined) waiting?.reject(new Error(message.error));
        else waiting?.resolve(message.value);
        return;
      }
      case 'disable':
        return this.events.disable();
    }
  }

  private invoke(id: number, fn: number, args: unknown[]): void {
    const run = this.functions.get(fn);
    if (!run) return this.send({ t: 'done', id });
    let result: unknown;
    try {
      result = run(...args);
    } catch (error) {
      return this.send({ t: 'done', id, error: describeError(error) });
    }
    if (!(result instanceof Promise)) return this.send({ t: 'done', id, value: this.answer(fn, args, result) });
    this.send({ t: 'done', id, pending: true });
    result.then(
      value => this.send({ t: 'settled', id, value: this.answer(fn, args, value) }),
      error => this.send({ t: 'settled', id, error: describeError(error) }));
  }
}

export const disposable = (dispose: () => void): Disposable => ({ dispose });
