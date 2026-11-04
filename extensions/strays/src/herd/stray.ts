import type { Sprite } from '@luft/extension-api';

import type { Pack } from '../packs/pack.js';
import { Graph, liftOf, type Move, type Spot } from '../world/graph.js';
import type { Platform, World } from '../world/world.js';
import { flightFrom, pickDestination, windowsInReach } from './choose.js';

export const STEP_S = 0.1;

const STAND_S: Bounds = [8, 22];
const SIT_S: Bounds = [25, 70];
const SLEEP_S: Bounds = [70, 240];
const HOVER_S: Bounds = [4, 14];
const STIR_S: Bounds = [10, 60];
const WALK_PIXELS: Bounds = [50, 280];
const CLIMB_PIXELS: Bounds = [70, 260];
const REFERENCE_CELL = 24;
const SHORTEST_LEAP_S = 0.45;
const LEAP_SPEED = 90;
const FLY_SPEED = 70;
const FLY_LIFT = 0.5;
const NOTICE_AWAKE = 0.85;
const NOTICE_ASLEEP = 0.25;
const CLING_AWAY = 20;
const CLING_S = 2;
const NEVER = Infinity;
const FASTEST_FALL = 520;
const GRAVITY = 900;
const STEP_PIXELS = 2;
const GLANCE_STEPS = 5;

type Bounds = readonly [number, number];
type Pose = 'stand' | 'sit' | 'sleep' | 'hover';

type Activity =
  | { kind: 'rest'; pose: Pose }
  | { kind: 'walk'; target: number; then(): void }
  | { kind: 'leap'; flying: boolean; startX: number; startY: number; onto: string; anchor: number; seconds: number; lift: number; elapsed: number }
  | { kind: 'air' }
  | { kind: 'climb'; top: number; surface: string | null; side: number }
  | { kind: 'play'; frames: readonly number[]; index: number; then(): void }
  | { kind: 'held' };

const between = ([low, high]: Bounds) => low + (high - low) * Math.random();

export const MOODS = {
  stand: 'mood-stand',
  sit: 'mood-sit',
  sleep: 'mood-sleep',
  hover: 'mood-hover',
  still: 'mood-still',
  walk: 'mood-walk',
  fall: 'mood-fall',
  climb: 'mood-climb',
  leap: 'mood-leap',
  fly: 'mood-fly',
  held: 'mood-held',
} as const;
export type Mood = keyof typeof MOODS;

/** One creature: where it is, what it's doing, and what it does next. */
export class Stray {
  x: number;
  y: number;
  /** When it next wants to do something, for a stray at rest. */
  wakeAt = NEVER;
  private velocityX = 0;
  private velocityY = 0;
  private facing = Math.random() < 0.5 ? 1 : -1;
  private platform: string | null = null;
  private anchor = 0;
  private activity: Activity = { kind: 'air' };
  private steps = 0;
  private shown = 0;
  private described: Mood | null = null;
  private clinging = 0;
  private route: Move[] = [];
  private graphOf: { world: World; graph: Graph } | null = null;
  private inReach = new Set<string>();

  constructor(readonly pack: Pack, readonly sprite: Sprite, private world: World, private readonly describe: (mood: Mood) => string) {
    this.x = between([world.body.width, world.display.width - world.body.width]);
    this.y = -world.body.height;
    this.shown = pack.frames.fall[0];
  }

  get display(): number {
    return this.world.display.index;
  }

  get moving(): boolean {
    return this.activity.kind !== 'rest';
  }

  /** How many display pixels a pixel of a 24 pixel frame takes up, so every size of frame moves alike. */
  private get pixel(): number {
    return this.world.body.height / REFERENCE_CELL;
  }

  private get frames() {
    return this.pack.frames;
  }

  private show(frame: number, mood: Mood): void {
    this.shown = frame;
    this.sprite.place({ display: this.display, x: this.x, y: this.y, frame, flipped: this.facing < 0 });
    if (mood === this.described) return;
    this.described = mood;
    this.sprite.describe(this.describe(mood));
  }

  private redraw(): void {
    this.show(this.shown, this.described ?? 'stand');
  }

  private stand(platform: Platform, x: number): void {
    this.platform = platform.id;
    this.anchor = x - platform.left;
    this.x = x;
    this.y = this.world.heightAt(platform, x);
  }

  private rest(pose: Pose): void {
    this.activity = { kind: 'rest', pose };
    const { stand, sit, sleep, fly } = this.frames;
    const looks = { stand: [stand, STAND_S], sit: [sit, SIT_S], sleep: [sleep, SLEEP_S], hover: [fly[0], HOVER_S] } as const;
    const [frame, seconds] = looks[pose];
    this.wakeAt = Date.now() + between(seconds) * 1000;
    this.show(frame, pose);
  }

  private play(frames: readonly number[], then: () => void): void {
    this.activity = { kind: 'play', frames, index: 0, then };
    this.wakeAt = NEVER;
  }

  private fall(speedX = 0, speedY = 0): void {
    this.platform = null;
    this.velocityX = speedX;
    this.velocityY = speedY;
    this.activity = { kind: 'air' };
    this.wakeAt = NEVER;
  }

  private get graph(): Graph {
    if (this.graphOf?.world !== this.world) this.graphOf = { world: this.world, graph: new Graph(this.world, this.pack.abilities) };
    return this.graphOf.graph;
  }

  private get spot(): Spot | null {
    const platform = this.platform ? this.world.find(this.platform) : null;
    return platform && this.graph.spotAt(platform, this.x);
  }

  private walkTo(x: number, then: () => void): void {
    const platform = this.platform ? this.world.find(this.platform) : null;
    if (!platform) {
      this.fall();
      return;
    }
    this.facing = x >= this.x ? 1 : -1;
    this.activity = { kind: 'walk', target: x - platform.left, then };
    this.wakeAt = NEVER;
  }

  /** Goes for a wander: somewhere further along, or across to somewhere it likes better. */
  private roam(): void {
    const spot = this.spot;
    if (!spot) {
      this.rest('stand');
      return;
    }
    const choice = pickDestination(this.graph, spot, this.pack);
    if ('kind' in choice) this.follow([choice]);
    else if (choice.moves.length) this.follow(choice.moves);
    else if (this.pack.abilities.walks) this.walkTo(this.placeIn(spot), () => this.lookThenStand(this.frames.look.slice(0, 2)));
    else this.rest('stand');
  }

  private placeIn({ span }: Spot): number {
    const reach = between(WALK_PIXELS);
    const way = this.anyWay();
    const room = way > 0 ? span.right - this.x : this.x - span.left;
    return Math.min(span.right, Math.max(span.left, this.x + reach * (room >= reach ? way : -way)));
  }

  private follow(moves: readonly Move[]): void {
    this.route = [...moves];
    this.nextMove();
  }

  private nextMove(): void {
    const move = this.route.shift();
    if (!move) {
      this.lookThenStand(this.frames.look.slice(0, GLANCE_STEPS));
      return;
    }
    if (move.kind === 'fly' || Math.abs(move.fromX - this.x) < 1) this.perform(move);
    else this.walkTo(move.fromX, () => this.perform(move));
  }

  private perform(move: Move): void {
    const onto = this.world.find(move.to.platform.id);
    if (!onto || (move.kind !== 'cling' && this.world.nearestOpen(onto, move.toX, this.world.body.width) === null)) {
      this.route = [];
      this.rest('stand');
    } else if (move.kind === 'climb' || move.kind === 'cling') {
      this.startClimb(move);
    } else {
      this.leap(move, onto);
    }
  }

  private leap(move: Move, onto: Platform): void {
    const flying = move.kind === 'fly';
    const distance = Math.hypot(move.toX - this.x, onto.y - this.y);
    const { height } = this.world.body;
    this.facing = move.toX >= this.x ? 1 : -1;
    this.platform = null;
    this.wakeAt = NEVER;
    this.activity = {
      kind: 'leap', flying, startX: this.x, startY: this.y, onto: onto.id, anchor: move.toX - onto.left, elapsed: 0,
      seconds: Math.max(SHORTEST_LEAP_S, distance / ((flying ? FLY_SPEED : LEAP_SPEED) * this.pixel)),
      lift: flying ? height * FLY_LIFT : liftOf(Math.abs(move.toX - this.x), this.y - onto.y, height),
    };
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

  /** Comes round after a rest and picks something to do. */
  decide(): void {
    if (this.activity.kind !== 'rest') return;
    const { pose } = this.activity;
    const roll = Math.random();
    if (pose === 'hover') return this.flyOff();
    if (pose === 'sleep') this.play(this.frames.wake, () => roll < 0.5 ? this.rest('stand') : this.sitDown());
    else if (pose === 'sit' && roll < this.pack.temper.sleepiness) this.play(this.frames.lieDown, () => this.rest('sleep'));
    else if (roll < 0.4) this.roam();
    else if (roll < 0.7) this.lookThenStand();
    else this.sitDown();
  }

  /** Hovering where it was let go, it picks somewhere it likes and flies there. */
  private flyOff(): void {
    const move = flightFrom(this.graph, this.x, this.pack);
    const onto = this.world.find(move.to.platform.id);
    if (onto) this.leap(move, onto);
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

  /** Drops whatever it's doing and goes to sleep where it would end up. */
  doze(): void {
    if (this.activity.kind === 'held') return;
    const platform = this.platform ? this.world.find(this.platform) : null;
    this.route = [];
    if (!platform || !this.world.spanAt(platform, this.x) && platform.kind === 'window') this.settle();
    this.sleepFor(NEVER);
  }

  private sleepFor(wakeAt: number): void {
    this.rest('sleep');
    this.wakeAt = wakeAt;
  }

  /** It's calm again: it sleeps on a while. */
  stir(): void {
    if (this.activity.kind === 'rest') this.wakeAt = Date.now() + between(STIR_S) * 1000;
  }

  private settle(): void {
    const found = this.world.landing(this.x, this.y, this.world.bottom);
    if (found) {
      this.stand(found, this.x);
      return;
    }
    const { platform, x } = this.world.resting(this.x);
    this.stand(platform, x);
  }

  picked(): void {
    this.platform = null;
    this.route = [];
    this.wakeAt = NEVER;
    this.activity = { kind: 'held' };
    this.show(this.frames.held[0], 'held');
  }

  carried(world: World, x: number, y: number): void {
    this.world = world;
    this.x = x;
    this.y = y;
  }

  /** Let go: on a window it lands on top, anywhere else it falls. */
  dropped(world: World, x: number, y: number, drowsy: boolean): void {
    this.carried(world, x, y);
    const below = world.windowAt(x, y - world.body.height / 2);
    if (below && world.spanAt(below, x)) {
      this.stand(below, x);
      this.landed(drowsy);
    } else if (drowsy) {
      this.activity = { kind: 'air' };
      this.doze();
    } else if (this.pack.abilities.flies) {
      this.rest('hover');
    } else {
      this.fall();
    }
  }

  private landed(drowsy: boolean): void {
    this.route = [];
    if (drowsy) this.sleepFor(NEVER);
    else this.play(this.frames.land, () => this.sitDown());
  }

  /** Windows or the taskbar moved or went: it rides along, gets nudged out of the way, or falls. */
  surfacesChanged(world: World, drowsy: boolean): void {
    this.world = world;
    if (this.activity.kind === 'held') return;
    if (this.activity.kind === 'climb') this.keepClimbing(this.activity);
    if (!this.platform || this.activity.kind === 'climb') return;
    const platform = world.find(this.platform);
    if (!platform) {
      this.lostFooting(drowsy);
      return;
    }
    const x = platform.left + this.anchor;
    const open = world.spanAt(platform, x) ? x : world.nearestOpen(platform, x, world.body.width);
    const hiddenOnGround = platform.kind !== 'window' && x >= platform.left && x <= platform.right;
    if (open === null && !hiddenOnGround) {
      this.x = Math.min(world.display.width, Math.max(0, x));
      this.lostFooting(drowsy);
      return;
    }
    this.stand(platform, open ?? x);
    this.redraw();
  }

  private lostFooting(drowsy: boolean): void {
    this.platform = null;
    if (drowsy) this.doze();
    else this.fall();
  }

  private keepClimbing(climb: Extract<Activity, { kind: 'climb' }>): void {
    if (!climb.surface) return;
    const surface = this.world.find(climb.surface);
    if (!surface) {
      this.fall();
      return;
    }
    climb.top = surface.y;
    this.x = this.besideWall(climb.side > 0 ? surface.left : surface.right, climb.side);
  }

  /** Where a stray's middle is while its side touches a wall. */
  private besideWall(wall: number, side: number): number {
    return wall - side * this.world.body.width / 2;
  }

  private startClimb(move: Move): void {
    const { side, to } = move;
    this.platform = null;
    this.facing = side;
    if (move.kind === 'climb') {
      this.x = this.besideWall(side > 0 ? to.platform.left : to.platform.right, side);
      this.activity = { kind: 'climb', top: to.platform.y, surface: to.platform.id, side };
    } else {
      this.clinging = 0;
      this.activity = { kind: 'climb', top: Math.max(this.world.body.height, this.y - between(CLIMB_PIXELS)), surface: null, side };
    }
    this.wakeAt = NEVER;
  }

  private stepWalk({ target, then }: Extract<Activity, { kind: 'walk' }>): void {
    const platform = this.platform ? this.world.find(this.platform) : null;
    const span = platform && this.world.spanAt(platform, this.x);
    if (!platform || !span) {
      this.fall();
      return;
    }
    const direction = this.facing;
    const goal = Math.min(span.right, Math.max(span.left, platform.left + target));
    const next = this.x + direction * this.pack.temper.stride * this.pixel * STEP_PIXELS;
    const arrived = direction > 0 ? next >= goal : next <= goal;
    this.stand(platform, arrived ? goal : next);
    this.show(this.loop(this.frames.walk), 'walk');
    if (arrived) then();
  }

  private stepLeap(leap: Extract<Activity, { kind: 'leap' }>): void {
    const onto = this.world.find(leap.onto);
    if (!onto) {
      this.fall();
      return;
    }
    leap.elapsed += STEP_S;
    const along = Math.min(1, leap.elapsed / leap.seconds);
    const endX = onto.left + leap.anchor;
    this.x = leap.startX + (endX - leap.startX) * along;
    this.y = leap.startY + (this.world.heightAt(onto, endX) - leap.startY) * along - leap.lift * 4 * along * (1 - along);
    if (along < 1) {
      this.show(this.loop(leap.flying ? this.frames.fly : this.frames.jump), leap.flying ? 'fly' : 'leap');
      return;
    }
    const place = this.world.nearestOpen(onto, endX, this.world.body.width);
    if (place === null) {
      this.fall();
      return;
    }
    this.stand(onto, place);
    this.play(this.frames.land, () => this.nextMove());
  }

  private stepAir(): void {
    const { gravity } = this.pack.temper;
    const half = this.world.body.width / 2;
    const from = this.y;
    this.velocityY = Math.min(FASTEST_FALL * Math.min(1, gravity), this.velocityY + GRAVITY * gravity * STEP_S);
    this.x = Math.max(half, Math.min(this.world.display.width - half, this.x + this.velocityX * STEP_S));
    this.y += this.velocityY * STEP_S;
    const found = this.velocityY > 0 ? this.world.landing(this.x, from, this.y) : null;
    if (found) {
      this.stand(found, this.x);
      this.landed(false);
    } else if (this.y >= this.world.bottom) {
      const { platform, x } = this.world.resting(this.x);
      this.stand(platform, x);
      this.landed(false);
    }
    this.show(this.loop(this.frames.fall), 'fall');
  }

  private stepClimb(climb: Extract<Activity, { kind: 'climb' }>): void {
    this.facing = climb.side;
    this.y = Math.max(climb.top, this.y - this.pack.temper.stride * this.pixel * STEP_PIXELS);
    this.show(this.loop(this.frames.climb), 'climb');
    if (this.y > climb.top) return;
    if (climb.surface) this.climbOver(climb.surface, climb.side);
    else if ((this.clinging += STEP_S) >= CLING_S) this.fall(-climb.side * CLING_AWAY * this.pixel);
  }

  private climbOver(id: string, side: number): void {
    const top = this.world.find(id);
    const onto = this.x + side * this.world.body.width;
    const place = top ? this.world.nearestOpen(top, onto, this.world.body.width * 2) : null;
    if (place === null) {
      this.fall(-side * CLING_AWAY * this.pixel);
      return;
    }
    this.stand(top!, place);
    this.nextMove();
  }

  private stepPlay(play: Extract<Activity, { kind: 'play' }>): void {
    if (play.index < play.frames.length) this.show(play.frames[play.index++], 'still');
    else play.then();
  }

  private loop(frames: readonly number[]): number {
    return frames[this.steps % frames.length];
  }

  /** One step of whatever it's doing. */
  step(): void {
    this.steps++;
    switch (this.activity.kind) {
      case 'walk': return this.stepWalk(this.activity);
      case 'leap': return this.stepLeap(this.activity);
      case 'air': return this.stepAir();
      case 'climb': return this.stepClimb(this.activity);
      case 'play': return this.stepPlay(this.activity);
      case 'held': return this.show(this.frames.held[(this.steps >> 1) % this.frames.held.length], 'held');
      case 'rest': return;
    }
  }
}
