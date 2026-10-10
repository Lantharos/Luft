import type Meta from 'gi://Meta';

import { LookError } from '../errors.js';
import type { Caller } from './callers.js';
import { Launches } from './launches.js';
import { watchUnit } from './lifetime.js';
import { askForAccess, type Level } from './prompt.js';

export type { Level } from './prompt.js';

export interface Grant {
  readonly caller: Caller;
  readonly level: Level;
}

interface HeldGrant extends Grant {
  readonly stop: () => void;
}

const RANK: Record<Level, number> = { see: 1, use: 2 };

class WindowAccess {
  readonly launches = new Launches();
  private readonly grants = new Map<string, HeldGrant>();
  private readonly prompts = new Map<string, Promise<boolean>>();
  private readonly listeners = new Set<() => void>();

  get active(): Grant[] {
    return [...this.grants.values()];
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  held(caller: Caller, window: Meta.Window | null): Level | null {
    if (window && this.launches.owner(window)?.unit === caller.unit) return 'use';
    return this.grants.get(caller.unit)?.level ?? null;
  }

  allows(caller: Caller, window: Meta.Window | null, level: Level): boolean {
    const held = this.held(caller, window);
    return !!held && RANK[held] >= RANK[level];
  }

  async require(caller: Caller, window: Meta.Window | null, level: Level): Promise<void> {
    if (this.allows(caller, window, level)) return;
    const key = `${caller.unit} ${level}`;
    let prompt = this.prompts.get(key);
    if (!prompt) {
      prompt = this.ask(caller, level).finally(() => this.prompts.delete(key));
      this.prompts.set(key, prompt);
    }
    if (!await prompt) throw new LookError('Denied', "The person using this computer didn't allow it");
  }

  revoke(unit: string): void {
    const grant = this.grants.get(unit);
    if (!grant) return;
    grant.stop();
    this.grants.delete(unit);
    this.changed();
  }

  reset(): void {
    for (const unit of [...this.grants.keys()]) this.revoke(unit);
    this.launches.destroy();
  }

  private async ask(caller: Caller, level: Level): Promise<boolean> {
    const answer = await askForAccess(caller, level);
    if (answer === 'until-quit') this.grant(caller, level);
    return answer !== 'deny';
  }

  private grant(caller: Caller, level: Level): void {
    this.grants.get(caller.unit)?.stop();
    this.grants.set(caller.unit, { caller, level, stop: watchUnit(caller.unit, () => this.revoke(caller.unit)) });
    this.changed();
  }

  private changed(): void {
    for (const listener of this.listeners) listener();
  }
}

export const windowAccess = new WindowAccess();
