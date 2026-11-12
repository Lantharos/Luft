import type { Kind } from './served.js';

const MOST_THINGS = 512;
const MOST_NOTIFICATIONS = 64;

type Methods = Record<string, (...args: unknown[]) => unknown>;

export interface Thing {
  kind: Kind;
  object: Methods;
}

export class Refs {
  private readonly things = new Map<number, Thing>();
  private readonly notifications: number[] = [];
  private highest = 0;
  private lasting = 0;

  claim(id: unknown): number {
    if (!Number.isSafeInteger(id) || (id as number) <= this.highest) throw new Error('it named something it made with a number it used before');
    return this.highest = id as number;
  }

  adopt(id: number, kind: Kind, object: unknown): void {
    this.things.set(id, { kind, object: object as Methods });
    if (kind !== 'notification') {
      if (++this.lasting > MOST_THINGS) throw new Error(`it made more than ${MOST_THINGS} things that last at once`);
      return;
    }
    this.notifications.push(id);
    if (this.notifications.length > MOST_NOTIFICATIONS) {
      const oldest = this.notifications.shift()!;
      this.things.get(oldest)?.object.dispose();
      this.things.delete(oldest);
    }
  }

  get(id: number): Thing | null {
    return this.things.get(id) ?? null;
  }

  forget(id: number): void {
    const thing = this.things.get(id);
    if (!thing) return;
    this.things.delete(id);
    if (thing.kind !== 'notification') this.lasting--;
    else this.notifications.splice(this.notifications.indexOf(id), 1);
  }

  clear(): void {
    this.things.clear();
    this.notifications.length = 0;
    this.lasting = 0;
  }
}
