import type { Encounter, Pack } from '../packs/pack.js';
import { between, type Bounds } from './activity.js';
import type { Pace } from './pace.js';
import type { Stray } from './stray.js';

const APART_S: Bounds = [25, 70];
const FIRST_MEETING = 0.35;
const FAVOURITE = 0.65;
const SEEK_OUT = 0.3;
const WAIT_S = 20;
const HOPS = 3;

function pickFrom(does: Pack['together']['does'], choices: readonly Encounter[]): Encounter | null {
  const total = choices.reduce((sum, choice) => sum + does[choice], 0);
  if (!total) return null;
  let roll = Math.random() * total;
  return choices.find(choice => (roll -= does[choice]) <= 0) ?? null;
}

function whatTheyDo(stray: Stray, other: Stray): Encounter | null {
  const { does, with: favourites } = stray.pack.together;
  const favourite = favourites[other.pack.name];
  const allowed = (encounter: Encounter) => !other.asleep || encounter === 'nap';
  if (favourite && allowed(favourite) && Math.random() < FAVOURITE) return favourite;
  return pickFrom(does, (Object.keys(does) as Encounter[]).filter(allowed));
}

function greet(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 1.1, () => {
    stray.faceTo(other);
    other.faceTo(stray);
    stray.acts('greet', () => stray.carriesOn());
    other.acts('greet', () => other.carriesOn());
  });
}

function chase(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 2.5, () => {
    other.bolts(stray, () => other.carriesOn());
    stray.runsAfter(other.heading, () => stray.carriesOn());
  }, 1.4, 'chase');
}

function stalk(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 3, () => stray.crouches(() => {
    other.bolts(stray, () => other.carriesOn());
    stray.hops(2.5, () => stray.carriesOn());
  }), 0.4, 'stalk');
}

function bump(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 0.7, () => {
    other.tumbles(stray, 1.2, () => other.carriesOn());
    stray.carriesOn();
  }, 1.6, 'chase');
}

function bounce(one: Stray, another: Stray, hops: number): void {
  if (!hops) {
    one.carriesOn();
    another.carriesOn();
    return;
  }
  one.faceTo(another);
  one.hops(0.6, () => {
    another.faceTo(one);
    bounce(another, one, hops - 1);
  });
}

function play(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 1.5, () => {
    other.acts('play', () => other.carriesOn());
    bounce(stray, other, HOPS);
  }, 1.2);
}

function nap(stray: Stray, other: Stray): boolean {
  return stray.goTo(other, 0.9, () => {
    stray.faceTo(other);
    stray.naps();
    other.naps();
  });
}

const ENCOUNTERS: Record<Encounter, (stray: Stray, other: Stray) => boolean> = { greet, chase, play, nap, stalk, bump };

/**
 * What strays get up to together. Only a stray that's just done something looks for company, and only now and then,
 * so nothing here runs while they're still or for pairs that aren't moving.
 */
export class Encounters {
  private readonly freeAt = new Map<Stray, number>();

  constructor(private readonly strays: () => readonly Stray[], private readonly pace: () => Pace) {}

  /** Sets everyone apart for a first short while. */
  welcome(stray: Stray): void {
    this.freeAt.set(stray, Date.now() + between(APART_S) * FIRST_MEETING * this.pace().solitude * 1000);
  }

  private keepApart(stray: Stray): void {
    this.freeAt.set(stray, Date.now() + between(APART_S) * this.pace().solitude * 1000);
  }

  private company(stray: Stray, seekOut: boolean): Stray | null {
    const now = Date.now();
    const free = this.strays().filter(other => other !== stray && other.approachable && (this.freeAt.get(other) ?? 0) <= now);
    const close = free.filter(other => stray.isNear(other));
    if (close.length) return close[Math.floor(Math.random() * close.length)];
    const here = free.filter(other => other.display === stray.display);
    return seekOut && here.length && Math.random() < SEEK_OUT ? here[Math.floor(Math.random() * here.length)] : null;
  }

  /** Whether `stray`, having just done something, starts something with another. `seekOut` lets it go to one further off. */
  consider(stray: Stray, seekOut = false): boolean {
    if ((this.freeAt.get(stray) ?? 0) > Date.now()) return false;
    const other = this.company(stray, seekOut);
    if (!other) return false;
    if (Math.random() >= stray.pack.together.chatty) {
      this.keepApart(stray);
      return false;
    }
    const encounter = whatTheyDo(stray, other);
    if (!encounter) return false;
    other.waitFor(WAIT_S);
    if (!ENCOUNTERS[encounter](stray, other)) return false;
    this.keepApart(stray);
    this.keepApart(other);
    return true;
  }
}
