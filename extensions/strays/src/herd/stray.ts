import type { Spot } from '../world/graph.js';
import { between, type Bounds, type Mood } from './activity.js';
import { Body } from './body.js';
import { flightFrom, pickDestination, windowsInReach } from './choose.js';
import type { Encounters } from './encounters.js';

const STIR_S: Bounds = [3, 20];
const WALK_PIXELS: Bounds = [90, 340];
const NOTICE_AWAKE = 0.85;
const NOTICE_ASLEEP = 0.25;
const GLANCE_STEPS = 2;
const LOOK_INSTEAD = 0.6;
const STEPS_BETWEEN_GLANCES = 6;
const NEAR_LENGTHS = 3;

/** One creature's mind: what it feels like doing next, alone or with another. */
export class Stray extends Body {
  encounters: Encounters | null = null;
  private justLeft: string | null = null;
  private inReach = new Set<string>();
  private untilGlance = STEPS_BETWEEN_GLANCES;

  /** Goes for a wander: somewhere further along, or across to somewhere it likes better. */
  private roam(): void {
    const spot = this.spot;
    if (!spot) {
      this.leavePerch();
      return;
    }
    const choice = pickDestination(this.graph, spot, this.pack, this.justLeft);
    this.justLeft = this.platform;
    if ('kind' in choice) this.follow([choice]);
    else if (choice.moves.length) this.follow(choice.moves);
    else if (this.pack.abilities.walks) this.walkTo(this.placeIn(spot), () => this.lookThenStand(this.frames.look.slice(0, GLANCE_STEPS)));
    else this.rest('stand');
  }

  /** There's nowhere to go from a spot nothing can be seen of, such as a window that's gone up against the top of the screen: it gets down. */
  private leavePerch(): void {
    if (this.pack.abilities.flies) this.flyOff();
    else this.fall();
  }

  private placeIn({ span }: Spot): number {
    const reach = between(WALK_PIXELS);
    const way = this.anyWay();
    const room = way > 0 ? span.right - this.x : this.x - span.left;
    return Math.min(span.right, Math.max(span.left, this.x + reach * (room >= reach ? way : -way)));
  }

  private anyWay(): number {
    return Math.random() < 0.5 ? 1 : -1;
  }

  private sitDown(): void {
    this.play(this.frames.sitDown, () => this.rest('sit'));
  }

  private lookThenStand(frames = this.frames.look): void {
    this.play(frames, () => this.rest('stand'));
  }

  protected override touchedDown(): void {
    if (!this.encounters?.consider(this)) this.sitDown();
  }

  /** Comes round after a rest and picks something to do. */
  decide(): void {
    if (this.activity.kind !== 'rest') return;
    const { pose } = this.activity;
    const { curiosity, sleepiness } = this.pack.temper;
    const { naps, eagerness } = this.pace();
    if (pose === 'hover') return this.flyOff();
    if (pose === 'sleep') return this.play(this.frames.wake, () => this.rest('stand'));
    if (this.encounters?.consider(this, true)) return;
    const roll = Math.random();
    if (pose === 'sit' && roll < sleepiness * naps) this.play(this.frames.lieDown, () => this.rest('sleep'));
    else if (Math.random() < curiosity * eagerness) this.roam();
    else if (roll < LOOK_INSTEAD) this.lookThenStand();
    else this.sitDown();
  }

  /** Hovering where it was let go, it picks somewhere it likes and flies there. */
  private flyOff(): void {
    const move = flightFrom(this.graph, this.x, this.pack);
    const onto = this.world.find(move.to.platform.id);
    if (onto) this.leap(onto, move.toX, true);
  }

  /** A click or a tap: it starts and goes off somewhere. */
  poke(): void {
    if (this.activity.kind !== 'rest') return;
    if (this.activity.pose === 'hover') return this.flyOff();
    if (this.activity.pose === 'sleep') this.play(this.frames.wake, () => this.roam());
    else this.roam();
  }

  /** Surfaces have stopped moving: a window that's come within reach is worth a look. */
  notice(): void {
    const spot = this.spot;
    if (!spot || this.activity.kind !== 'rest') return;
    const moves = windowsInReach(this.graph, spot);
    const fresh = moves.filter(move => !this.inReach.has(move.to.platform.id));
    this.inReach = new Set(moves.map(move => move.to.platform.id));
    if (!fresh.length) return;
    const asleep = this.activity.pose === 'sleep';
    if (Math.random() >= (asleep ? NOTICE_ASLEEP : NOTICE_AWAKE)) return;
    const go = () => this.follow([fresh[0]]);
    if (asleep) this.play(this.frames.wake, go);
    else go();
  }

  /** It's calm again: it sleeps on a while. */
  stir(): void {
    if (this.activity.kind === 'rest') this.wakeAt = Date.now() + between(STIR_S) * this.pace().rests * 1000;
  }

  protected override strode(): void {
    if (--this.untilGlance > 0 || this.route.length) return;
    this.untilGlance = STEPS_BETWEEN_GLANCES;
    this.encounters?.consider(this);
  }

  /** Whether it's somewhere it could be gone up to: at rest, on its feet or asleep. */
  get approachable(): boolean {
    return this.activity.kind === 'rest' && this.activity.pose !== 'hover' && !!this.platform;
  }

  get asleep(): boolean {
    return this.activity.kind === 'rest' && this.activity.pose === 'sleep';
  }

  isNear(other: Stray): boolean {
    return this.display === other.display && Math.abs(this.x - other.x) <= this.length * NEAR_LENGTHS && Math.abs(this.y - other.y) <= this.length;
  }

  /** Stays where it is for now, for someone coming over. */
  waitFor(seconds: number): void {
    if (this.activity.kind === 'rest') this.wakeAt = Math.max(this.wakeAt, Date.now() + seconds * 1000);
  }

  /** Goes over to `other`, `lengths` of itself short of it, and then does `then`. Says whether it can get there. */
  goTo(other: Stray, lengths: number, then: () => void, speed = 1, mood: Mood = 'walk'): boolean {
    const here = this.spot;
    const there = other.spot;
    if (!here || !there) return false;
    const arrive = () => other.approachable ? then() : this.carriesOn();
    const side = this.x <= other.x ? -1 : 1;
    const stopAt = other.x + side * this.length * lengths;
    const closeBy = Math.min(there.span.right, Math.max(there.span.left, stopAt));
    if (here.key === there.key) {
      this.walkTo(closeBy, arrive, speed, mood);
      return true;
    }
    const route = this.graph.routesFrom(here).find(({ spot }) => spot.key === there.key);
    if (!route) return false;
    this.follow(route.moves, () => this.walkTo(closeBy, arrive, speed, mood));
    return true;
  }

  faceTo(other: Stray): void {
    this.facing = other.x >= this.x ? 1 : -1;
    this.redraw();
  }

  /** Looks about for a moment, with what it's up to for screen readers, and then does `then`. */
  acts(mood: Mood, then: () => void): void {
    this.play(this.frames.look, then, mood);
  }

  /** Stops and takes in the world again. */
  carriesOn(): void {
    if (this.platform) this.lookThenStand(this.frames.look.slice(0, GLANCE_STEPS));
  }

  /** Crouches, ready to spring. */
  crouches(then: () => void): void {
    this.play([...this.frames.sitDown, ...Array<number>(8).fill(this.frames.sit)], then, 'stalk');
  }

  /** A hop that lands `lengths` of itself ahead, on what it's standing on. */
  hops(lengths: number, then: () => void): void {
    const platform = this.footing;
    const spot = this.spot;
    if (!platform || !spot) return then();
    const toX = Math.min(spot.span.right, Math.max(spot.span.left, this.x + this.facing * lengths * this.length));
    this.leap(platform, toX, false);
    this.onLanding(then);
  }

  /** Goes well away from `other`, by air if it can. */
  bolts(from: Stray, then: () => void): void {
    if (!this.approachable) return;
    if (this.pack.abilities.flies) return this.flyOff();
    const spot = this.spot;
    if (!spot) return then();
    const way = this.x >= from.x ? 1 : -1;
    const goal = this.x + way * between(WALK_PIXELS);
    this.walkTo(Math.min(spot.span.right, Math.max(spot.span.left, goal)), then, 2, 'flee');
  }

  /** Follows `other` to where it's heading. */
  runsAfter(x: number, then: () => void): void {
    const spot = this.spot;
    if (!spot) return then();
    this.walkTo(Math.min(spot.span.right, Math.max(spot.span.left, x)), then, 1.8, 'chase');
  }

  /** Gets knocked `lengths` of itself sideways. */
  tumbles(from: Stray, lengths: number, then: () => void): void {
    if (!this.approachable) return;
    this.facing = this.x >= from.x ? 1 : -1;
    const spot = this.spot;
    if (!spot || !this.footing) return then();
    const toX = Math.min(spot.span.right, Math.max(spot.span.left, this.x + this.facing * lengths * this.length));
    this.leap(this.footing, toX, false);
    this.onLanding(() => this.play(this.frames.land, then, 'bumped'));
  }

  /** Curls up for a nap. */
  naps(): void {
    if (this.asleep || !this.platform) return;
    this.play([...this.frames.sitDown, ...this.frames.lieDown], () => this.rest('sleep'));
  }

  /** Where it's walking to, if it's walking. */
  get heading(): number {
    return this.activity.kind === 'walk' ? (this.footing?.left ?? 0) + this.activity.target : this.x;
  }
}
