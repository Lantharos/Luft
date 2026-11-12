import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { locale } from '../../../shared/i18n/index.js';
import type { ApiContext } from '../../api/v1/core/context.js';
import type { Capability } from '../../api/v1/types.js';
import { Channel } from '../channel.js';
import type { FromHost, Init, ToHost } from '../protocol.js';
import { type Accept, type Decoding, Refused, type Stub } from './accept.js';
import { spawnHost } from './launch.js';
import { limitScope } from './limits.js';
import { Mirrors } from './mirrors.js';
import { Refs } from './refs.js';
import { type Api, CALLS, ENDS_REF, type Made, METHODS } from './served.js';

const LIMITS = { longestLine: 2 * 1024 * 1024, mostQueued: 32 * 1024 * 1024 };
const READY_TIMEOUT = 20000;
const ANSWER_TIMEOUT = 10000;
const STOP_GRACE = 1000;
const MOST_WAITING = 256;
const BUDGET = 20000;

class Bucket {
  private level: number;
  private time = GLib.get_monotonic_time();

  constructor(private readonly capacity: number, private readonly perSecond: number) {
    this.level = capacity;
  }

  take(amount: number): boolean {
    const now = GLib.get_monotonic_time();
    this.level = Math.min(this.capacity, this.level + (now - this.time) / 1e6 * this.perSecond);
    this.time = now;
    this.level -= amount;
    return this.level >= 0;
  }
}

interface Waiting {
  resolve(value: unknown): void;
  reject(error: Error): void;
  result: Accept<unknown> | null;
  timer: number;
}

type Message = Partial<Record<'t' | 'path' | 'name' | 'error', unknown>> & { id?: unknown; ref?: unknown; target?: unknown; args?: unknown; value?: unknown; pending?: unknown };

export class HostConnection {
  private readonly process: Gio.Subprocess;
  private readonly channel: Channel;
  private readonly refs = new Refs();
  private readonly waiting = new Map<number, Waiting>();
  private readonly messages = new Bucket(400, 200);
  private readonly bytes = new Bucket(8 * 1024 * 1024, 2 * 1024 * 1024);
  private invocations = 0;
  private closed = false;
  private started: { resolve(): void; reject(error: Error): void; timer: number } | null = null;

  constructor(private readonly api: Api, private readonly context: ApiContext, private readonly granted: ReadonlySet<Capability>, private readonly failed: (error: Error) => void) {
    this.process = spawnHost(context);
    this.channel = new Channel(this.process.get_stdout_pipe()!, this.process.get_stdin_pipe()!, LIMITS, {
      line: (text, size) => this.received(text, size),
      closed: reason => this.fail(reason ?? 'its process closed its connection'),
    });
    this.process.wait_async(null, () => {
      const status = this.process.get_if_exited() ? `exit status ${this.process.get_exit_status()}` : `signal ${this.process.get_term_sig()}`;
      this.fail(`its process ended with ${status}`);
    });
  }

  async start(): Promise<void> {
    const ready = new Promise<void>((resolve, reject) => {
      const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, READY_TIMEOUT, () => {
        this.started!.timer = 0;
        this.fail('it took longer than 20 seconds to turn on');
        return GLib.SOURCE_REMOVE;
      });
      this.started = { resolve, reject, timer };
    });
    await limitScope(this.context.manifest.id, Number(this.process.get_identifier()));
    if (this.closed) return ready;
    const mirrors = new Mirrors(this.api, this.context, this.granted);
    const { manifest, name, path, dataPath, stored, values } = this.context;
    const init: Init = {
      t: 'init', manifest, name, path, dataPath, locale: locale(),
      stored: Object.fromEntries(stored.keys().map(key => [key, stored.get(key)!])),
      settings: Object.fromEntries(values.descriptions.map(({ key }) => [key, values.get(key)])),
      mirrors: mirrors.snapshot(),
    };
    this.send(init);
    mirrors.follow((area, value) => this.send({ t: 'mirror', area, value }));
    this.api.settings.onChanged(key => this.send({ t: 'setting', key, value: this.api.settings.get(key) }));
    return ready;
  }

  stop(): void {
    if (this.closed) return;
    this.close(new Error('it was turned off'));
    this.channel.send({ t: 'disable' } satisfies ToHost);
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, STOP_GRACE, () => {
      this.process.force_exit();
      return GLib.SOURCE_REMOVE;
    });
  }

  private close(error: Error): void {
    this.closed = true;
    this.refs.clear();
    for (const waiting of this.waiting.values()) {
      if (waiting.timer) GLib.source_remove(waiting.timer);
      waiting.reject(error);
    }
    this.waiting.clear();
    if (this.started) {
      if (this.started.timer) GLib.source_remove(this.started.timer);
      this.started.reject(error);
      this.started = null;
    }
  }

  private fail(reason: unknown): void {
    if (this.closed) return;
    const error = reason instanceof Error ? reason : new Error(`It stopped running in its sandbox: ${reason}`);
    const starting = this.started !== null;
    this.close(error);
    this.process.force_exit();
    this.channel.close();
    if (!starting) this.failed(error);
  }

  private send(message: ToHost): void {
    this.channel.send(message);
  }

  private received(text: string, size: number): void {
    if (this.closed) return;
    if (!this.messages.take(1) || !this.bytes.take(size)) {
      this.fail('it sent more than the desktop takes in a moment');
      return;
    }
    let message: Message;
    try {
      message = JSON.parse(text) as Message;
    } catch {
      this.fail("it sent something that isn't a message");
      return;
    }
    if (typeof message !== 'object' || message === null) this.fail("it sent something that isn't a message");
    else this.handle(message);
  }

  private handle(message: Message): void {
    switch (message.t as FromHost['t']) {
      case 'ready':
        if (!this.started) return this.fail('it said it was ready twice');
        GLib.source_remove(this.started.timer);
        this.started.resolve();
        this.started = null;
        return;
      case 'call':
      case 'method':
        return this.run(message);
      case 'done':
        return this.answered(message, message.pending === true);
      case 'settled':
        return this.answered(message, false);
      case 'failed':
        return this.fail(new Error(typeof message.error === 'string' ? message.error.slice(0, 4000) : 'it failed'));
      default:
        return this.fail("it sent a message the desktop doesn't know");
    }
  }

  private run(message: Message): void {
    const id = message.id === undefined ? null : Number.isSafeInteger(message.id) ? message.id as number : NaN;
    try {
      if (Number.isNaN(id) || !Array.isArray(message.args)) throw new Refused("it sent a call the desktop can't read");
      const result = message.t === 'call' ? this.call(message, message.args) : this.method(message, message.args);
      if (id !== null) this.reply(id, result);
      else if (result instanceof Promise) result.catch(error => this.fail(error));
    } catch (error) {
      if (error instanceof Refused || Number.isNaN(id)) this.fail(error);
      else if (id !== null) this.send({ t: 'reply', id, error: (error as Error).message });
      else console.warn(`${this.context.manifest.id} asked for something the desktop refused: ${(error as Error).message}`);
    }
  }

  private call(message: Message, args: unknown[]): unknown {
    const path = String(message.path);
    const served = Object.hasOwn(CALLS, path) ? CALLS[path] : null;
    if (!served) throw new Refused(`${path} isn't part of the API extensions from your own folder get`);
    if (served.needs && !this.granted.has(served.needs)) throw new Refused(`${path} needs the ${served.needs} permission in extension.toml`);
    if (!served.kind !== (message.ref === undefined)) throw new Refused(`${path} was called the wrong way`);
    const ref = served.kind ? this.refs.claim(message.ref) : 0;
    const made = this.made(ref);
    const result = served.run(this.api, this.decode(served.args, args, path) as never[], made);
    if (served.kind && !made.released) this.refs.adopt(ref, served.kind, result);
    return served.kind ? undefined : result;
  }

  private method(message: Message, args: unknown[]): unknown {
    const target = Number(message.target);
    const name = String(message.name);
    const thing = this.refs.get(target);
    if (!thing) return undefined;
    const accepts = Object.hasOwn(METHODS[thing.kind], name) ? METHODS[thing.kind][name] : null;
    if (!accepts) throw new Refused(`${thing.kind} has no ${name}`);
    const result = thing.object[name](...this.decode(accepts, args, `${thing.kind}.${name}`));
    if (ENDS_REF.has(name)) this.refs.forget(target);
    return result;
  }

  private made(ref: number): Made & { released: boolean } {
    const made = {
      released: false,
      push: (state: Record<string, unknown>) => this.send({ t: 'ref', ref, state }),
      release: () => {
        made.released = true;
        this.refs.forget(ref);
      },
    };
    return made;
  }

  private reply(id: number, result: unknown): void {
    Promise.resolve(result).then(
      value => this.send({ t: 'reply', id, value }),
      error => this.send({ t: 'reply', id, error: (error as Error).message ?? String(error) }));
  }

  private decode(accepts: Accept<unknown>[], args: unknown[], where: string): unknown[] {
    if (args.length > accepts.length) throw new Refused(`${where} takes at most ${accepts.length} arguments`);
    const decoding: Decoding = {
      budget: BUDGET,
      depth: 0,
      stub: (fn, result) => this.stub(fn, result),
      ref: (ref, kinds) => {
        const thing = this.refs.get(ref);
        if (!thing || !kinds.includes(thing.kind)) throw new Refused(`${where} must name one of its ${kinds.join(' or ')}s`);
        return thing.object;
      },
    };
    return accepts.map((accept, index) => accept(args[index], `${where} argument ${index + 1}`, decoding));
  }

  private stub(fn: number, result: Accept<unknown> | null): Stub {
    return (...args) => new Promise((resolve, reject) => {
      if (this.closed) return reject(new Error('its sandbox has stopped'));
      if (this.waiting.size >= MOST_WAITING) {
        this.fail('it stopped answering the desktop');
        return reject(new Error('its sandbox has stopped'));
      }
      const id = ++this.invocations;
      const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, ANSWER_TIMEOUT, () => {
        this.waiting.get(id)!.timer = 0;
        this.fail('it took longer than 10 seconds to answer the desktop');
        return GLib.SOURCE_REMOVE;
      });
      this.waiting.set(id, { resolve, reject, result, timer });
      this.send({ t: 'invoke', id, fn, args });
    });
  }

  private answered(message: Message, pending: boolean): void {
    const id = Number(message.id);
    const waiting = this.waiting.get(id);
    if (!waiting) return;
    if (waiting.timer) GLib.source_remove(waiting.timer);
    if (pending) {
      waiting.timer = 0;
      return;
    }
    this.waiting.delete(id);
    if (message.error !== undefined) {
      const error = new Error(String(message.error).slice(0, 4000));
      this.fail(error);
      waiting.reject(error);
      return;
    }
    try {
      waiting.resolve(waiting.result ? this.decode([waiting.result], [message.value], 'what it answered')[0] : undefined);
    } catch (error) {
      this.fail(error);
      waiting.reject(error as Error);
    }
  }
}
