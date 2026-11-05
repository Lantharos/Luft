import type { Sprite, SurfaceDisplay } from '@luft/extension-api';

import type { Pack } from '../packs/pack.js';
import { Graph, liftOf, type Move, type Spot } from '../world/graph.js';
import type { Platform, World } from '../world/world.js';
import { type Activity, between, type Bounds, type Climb, type Leap, type Mood, type Play, type Pose, type Walk } from './activity.js';
import type { Pace } from './pace.js';

export const STEP_S = 0.1;

const STAND_S: Bounds = [2, 7];
const SIT_S: Bounds = [5, 16];
const SLEEP_S: Bounds = [14, 45];
const HOVER_S: Bounds = [2, 7];
const CLIMB_PIXELS: Bounds = [70, 260];
const REFERENCE_CELL = 24;
const SHORTEST_LEAP_S = 0.45;
const LEAP_SPEED = 90;
const FLY_SPEED = 70;
const FLY_LIFT = 0.5;
const CLING_AWAY = 20;
const CLING_S = 2;
const NEVER = Infinity;
const FASTEST_FALL = 520;
const GRAVITY = 900;
const STEP_PIXELS = 2;
const RESTLESS_LENGTH = 1.5;

/** A creature's body: where it is, what's holding it up, and one step of whatever it's doing. */
export class Body {
  x: number;
  y: number;
  /** When it next wants to do something, for a stray at rest. */
  wakeAt = NEVER;
  protected facing = Math.random() < 0.5 ? 1 : -1;
  protected platform: string | null = null;
  protected activity: Activity = { kind: 'air' };
  protected route: Move[] = [];
  private arrived: (() => void) | null = null;
  private velocityX = 0;
  private velocityY = 0;
  private anchor = 0;
  private steps = 0;
  private shown = 0;
  private described: Mood | null = null;
  private clinging = 0;
  private graphOf: { world: World; graph: Graph } | null = null;

  constructor(readonly pack: Pack, readonly sprite: Sprite, protected world: World, private readonly describe: (mood: Mood) => string, protected readonly pace: () => Pace) {
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

  /** How long it is, in pixels on its display. */
  get length(): number {
    return this.world.body.height;
  }

  /** How many display pixels a pixel of a 24 pixel frame takes up, so every size of frame moves alike. */
  protected get pixel(): number {
    return this.world.body.height / REFERENCE_CELL;
  }

  protected get frames() {
    return this.pack.frames;
  }

  protected get footing(): Platform | null {
    return this.platform ? this.world.find(this.platform) : null;
  }

  protected show(frame: number, mood: Mood): void {
    this.shown = frame;
    const on = this.footing;
    const { display, facing } = this;
    const place = { display, frame, flipped: facing < 0 };
    this.sprite.place(on?.kind === 'window' ? { ...place, on: on.id, x: this.x - on.left, y: this.y - on.y } : { ...place, x: this.x, y: this.y });
    if (mood === this.described) return;
    this.described = mood;
    this.sprite.describe(this.describe(mood));
  }

  protected redraw(): void {
    this.show(this.shown, this.described ?? 'stand');
  }

  private stand(platform: Platform, x: number): void {
    this.platform = platform.id;
    this.anchor = x - platform.left;
    this.x = x;
    this.y = this.world.heightAt(platform, x);
  }

  protected rest(pose: Pose): void {
    this.activity = { kind: 'rest', pose };
    const { stand, sit, sleep, fly } = this.frames;
    const looks = { stand: [stand, STAND_S], sit: [sit, SIT_S], sleep: [sleep, SLEEP_S], hover: [fly[0], HOVER_S] } as const;
    const [frame, seconds] = looks[pose];
    this.wakeAt = Date.now() + between(seconds) * this.pace().rests * (RESTLESS_LENGTH - this.pack.temper.curiosity) * 1000;
    this.show(frame, pose);
  }

  protected play(frames: readonly number[], then: () => void, mood: Mood = 'still'): void {
    this.activity = { kind: 'play', frames, index: 0, mood, then };
    this.wakeAt = NEVER;
  }

  protected fall(speedX = 0, speedY = 0): void {
    this.platform = null;
    this.velocityX = speedX;
    this.velocityY = speedY;
    this.activity = { kind: 'air' };
    this.wakeAt = NEVER;
  }

  protected get graph(): Graph {
    if (this.graphOf?.world !== this.world) this.graphOf = { world: this.world, graph: new Graph(this.world, this.pack.abilities) };
    return this.graphOf.graph;
  }

  protected get spot(): Spot | null {
    const platform = this.footing;
    return platform && this.graph.spotAt(platform, this.x);
  }

  protected walkTo(x: number, then: () => void, speed = 1, mood: Mood = 'walk'): void {
    const platform = this.footing;
    if (!platform) {
      this.fall();
      return;
    }
    this.facing = x >= this.x ? 1 : -1;
    this.activity = { kind: 'walk', target: x - platform.left, speed, mood, then };
    this.wakeAt = NEVER;
  }

  /** Takes these moves, then does `then`, or has a look around. */
  protected follow(moves: readonly Move[], then: (() => void) | null = null): void {
    this.route = [...moves];
    this.arrived = then;
    this.nextMove();
  }

  /** Does `then` once it's come down from the leap it just started. */
  protected onLanding(then: () => void): void {
    this.route = [];
    this.arrived = then;
  }

  protected abandonRoute(): void {
    this.route = [];
    this.arrived = null;
  }

  private nextMove(): void {
    const move = this.route.shift();
    if (!move) {
      const arrived = this.arrived;
      this.arrived = null;
      if (arrived) arrived();
      else this.play(this.frames.look.slice(0, 5), () => this.rest('stand'));
      return;
    }
    if (move.kind === 'fly' || Math.abs(move.fromX - this.x) < 1) this.perform(move);
    else this.walkTo(move.fromX, () => this.perform(move));
  }

  private perform(move: Move): void {
    const onto = this.world.find(move.to.platform.id);
    if (!onto || (move.kind !== 'cling' && this.world.nearestOpen(onto, move.toX, this.world.body.width) === null)) {
      this.abandonRoute();
      this.rest('stand');
    } else if (move.kind === 'climb' || move.kind === 'cling') {
      this.startClimb(move);
    } else if (move.kind === 'scale') {
      this.leapAtWall(move, onto);
    } else {
      this.leap(onto, move.toX, move.kind === 'fly');
    }
  }

  /** Into the air and down on `onto`, where it then carries on with its route. */
  protected leap(onto: Platform, toX: number, flying = false): void {
    const distance = Math.hypot(toX - this.x, onto.y - this.y);
    const { height } = this.world.body;
    this.facing = toX >= this.x ? 1 : -1;
    this.leaveTheGround();
    this.activity = {
      kind: 'leap', flying, startX: this.x, startY: this.y, onto: onto.id, anchor: toX - onto.left, depth: 0, elapsed: 0, climbsAfter: null,
      seconds: Math.max(SHORTEST_LEAP_S, distance / ((flying ? FLY_SPEED : LEAP_SPEED) * this.pixel)),
      lift: flying ? height * FLY_LIFT : liftOf(Math.abs(toX - this.x), this.y - onto.y, height),
    };
  }

  private leapAtWall(move: Move, onto: Platform): void {
    const surface = this.world.surfaces.find(({ id }) => id === onto.id)!;
    const x = this.besideWall(move.side > 0 ? onto.left : onto.right, move.side);
    const y = Math.min(this.y, surface.y + surface.height);
    const distance = Math.hypot(x - this.x, y - this.y);
    this.facing = move.side;
    this.leaveTheGround();
    this.activity = {
      kind: 'leap', flying: false, startX: this.x, startY: this.y, onto: onto.id, anchor: x - onto.left, depth: y - onto.y, elapsed: 0, climbsAfter: move,
      seconds: Math.max(SHORTEST_LEAP_S, distance / (LEAP_SPEED * this.pixel)),
      lift: liftOf(Math.abs(x - this.x), this.y - y, this.world.body.height),
    };
  }

  private leaveTheGround(): void {
    this.platform = null;
    this.wakeAt = NEVER;
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

  /** Drops whatever it's doing and goes to sleep where it would end up. */
  doze(): void {
    if (this.activity.kind === 'held') return;
    this.abandonRoute();
    if (!this.footing) this.settle();
    this.sleepFor(NEVER);
  }

  protected sleepFor(wakeAt: number): void {
    this.rest('sleep');
    this.wakeAt = wakeAt;
  }

  picked(): void {
    this.platform = null;
    this.abandonRoute();
    this.wakeAt = NEVER;
    this.activity = { kind: 'held' };
    this.show(this.frames.held[0], 'held');
  }

  /** Let go: on a window it lands on top, anywhere else it falls. */
  dropped(world: World, x: number, y: number, drowsy: boolean): void {
    this.world = world;
    this.x = x;
    this.y = y;
    const below = world.windowAt(x, y - world.body.height / 2);
    const place = below ? world.nearestOpen(below, x, Infinity) : null;
    if (below && place !== null) {
      this.stand(below, place);
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
    this.abandonRoute();
    if (drowsy) this.sleepFor(NEVER);
    else this.play(this.frames.land, () => this.touchedDown());
  }

  /** It's come down from somewhere. */
  protected touchedDown(): void {
    this.play(this.frames.sitDown, () => this.rest('sit'));
  }

  /** The display that shows it: its own, or wherever the window under it has gone. */
  private homeAmong(displays: readonly SurfaceDisplay[]): SurfaceDisplay {
    const own = displays.find(({ index }) => index === this.display) ?? displays[0];
    if (this.footing?.kind !== 'window') return own;
    const shows = displays.find(({ windows, width }) => {
      const window = windows.find(({ id }) => id === this.platform);
      return !!window && window.x + this.anchor >= 0 && window.x + this.anchor <= width;
    });
    return shows ?? own;
  }

  /** Windows or the taskbar moved or went: on a window it goes along with it, elsewhere it gets nudged out of the way, or it falls. */
  surfacesChanged(displays: readonly SurfaceDisplay[], worldOf: (display: SurfaceDisplay, stray: Body) => World, drowsy: boolean): void {
    const world = worldOf(this.homeAmong(displays), this);
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
    if (platform.kind === 'window') this.ride(platform, x, drowsy);
    else this.keepToTheGround(platform, x, drowsy);
  }

  /** Nothing that happens to a window throws it off, short of the window taking it off the side of the screen. */
  private ride(platform: Platform, x: number, drowsy: boolean): void {
    const { width } = this.world.display;
    const along = Math.min(platform.right, Math.max(platform.left, x));
    if (along < 0 || along > width) {
      this.x = Math.min(width, Math.max(0, along));
      this.lostFooting(drowsy);
      return;
    }
    this.stand(platform, along);
    this.redraw();
  }

  private keepToTheGround(platform: Platform, x: number, drowsy: boolean): void {
    const { world } = this;
    const open = world.spanAt(platform, x) ? x : world.nearestOpen(platform, x, world.body.width);
    if (open === null && (x < platform.left || x > platform.right)) {
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

  private keepClimbing(climb: Climb): void {
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
    this.leaveTheGround();
    this.facing = side;
    if (move.kind === 'cling') {
      this.clinging = 0;
      this.activity = { kind: 'climb', top: Math.max(this.world.body.height, this.y - between(CLIMB_PIXELS)), surface: null, side };
    } else {
      this.x = this.besideWall(side > 0 ? to.platform.left : to.platform.right, side);
      this.activity = { kind: 'climb', top: to.platform.y, surface: to.platform.id, side };
    }
  }

  /** Runs every so often along the way, for what might be near. */
  protected strode(): void {}

  private stepWalk({ target, then, speed, mood }: Walk): void {
    const platform = this.footing;
    const span = platform && this.world.spanAt(platform, this.x);
    if (!platform) {
      this.fall();
      return;
    }
    if (!span) {
      if (platform.kind === 'window') {
        this.abandonRoute();
        this.rest('stand');
      } else {
        this.fall();
      }
      return;
    }
    const direction = this.facing;
    const goal = Math.min(span.right, Math.max(span.left, platform.left + target));
    const next = this.x + direction * this.pack.temper.stride * this.pixel * STEP_PIXELS * speed;
    const arrived = direction > 0 ? next >= goal : next <= goal;
    this.stand(platform, arrived ? goal : next);
    this.show(this.loop(this.frames.walk), mood);
    if (arrived) then();
    else this.strode();
  }

  private stepLeap(leap: Leap): void {
    const onto = this.world.find(leap.onto);
    if (!onto) {
      this.fall();
      return;
    }
    leap.elapsed += STEP_S;
    const along = Math.min(1, leap.elapsed / leap.seconds);
    const endX = onto.left + leap.anchor;
    const endY = leap.depth ? onto.y + leap.depth : this.world.heightAt(onto, endX);
    this.x = leap.startX + (endX - leap.startX) * along;
    this.y = leap.startY + (endY - leap.startY) * along - leap.lift * 4 * along * (1 - along);
    if (along < 1) {
      this.show(this.loop(leap.flying ? this.frames.fly : this.frames.jump), leap.flying ? 'fly' : 'leap');
      return;
    }
    if (leap.climbsAfter) {
      this.startClimb(leap.climbsAfter);
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

  private stepClimb(climb: Climb): void {
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

  private stepPlay(play: Play): void {
    if (play.index < play.frames.length) this.show(play.frames[play.index++], play.mood);
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
