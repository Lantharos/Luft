import type { Abilities } from '../packs/pack.js';
import type { Platform, Span, World } from './world.js';

/** One stretch a stray can walk along without anything in the way. */
export interface Spot {
  key: string;
  platform: Platform;
  span: Span;
}

/** One way of getting from a spot to another: `jump` and `drop` arc through the air, `fly` goes straight there. */
export interface Move {
  kind: 'jump' | 'drop' | 'fly' | 'climb' | 'cling';
  from: Spot;
  to: Spot;
  /** Where it sets off from, where it lands. */
  fromX: number;
  toX: number;
  /** The side the wall is on, for `climb` and `cling`. */
  side: number;
}

export interface Route {
  spot: Spot;
  moves: readonly Move[];
}

const ARC_SAMPLES = 8;
const MOST_MOVES_ON_A_ROUTE = 3;
const HIGHEST_RISE = 0.9;
const LIFT_LENGTHS = 0.7;
const LIFT_PER_PIXEL = 0.2;
const LIFT_PER_RISE = 0.6;

const clamp = (value: number, { left, right }: Span) => Math.min(right, Math.max(left, value));

/** How high a leap's arc bulges above a straight line, higher for a leap upwards so it clears what it lands on. */
export function liftOf(distance: number, rise: number, height: number): number {
  return Math.max(height * LIFT_LENGTHS, distance * LIFT_PER_PIXEL) + Math.max(0, rise) * LIFT_PER_RISE;
}

/** Every way across a display for one kind of creature, worked out once when someone first asks after surfaces moved. */
export class Graph {
  readonly spots: readonly Spot[];
  private readonly movesBySpot = new Map<Spot, readonly Move[]>();

  constructor(private readonly world: World, private readonly abilities: Abilities) {
    this.spots = world.platforms.flatMap(platform => platform.open.map((span, index) => ({ key: `${platform.id}#${index}`, platform, span })));
  }

  spotAt(platform: Platform, x: number): Spot | null {
    return this.spots.find(spot => spot.platform === platform && x >= spot.span.left && x <= spot.span.right) ?? null;
  }

  /** A little in from the edge of a span, so nobody lands on a rounded corner. */
  private inward(x: number, span: Span): number {
    const middle = (span.left + span.right) / 2;
    const step = Math.min(this.world.body.width, Math.abs(middle - x));
    return x + Math.sign(middle - x) * step;
  }

  private jumpBetween(from: Spot, to: Spot, reach: number): Move | null {
    const fromX = clamp((to.span.left + to.span.right) / 2, from.span);
    const toX = this.inward(clamp(fromX, to.span), to.span);
    const distance = Math.abs(toX - fromX);
    const rise = from.platform.y - to.platform.y;
    if (distance > reach || rise > reach * HIGHEST_RISE) return null;
    if (!this.clearArc(from, to, fromX, toX)) return null;
    return { kind: 'jump', from, to, fromX, toX, side: Math.sign(toX - fromX) };
  }

  /** Whether a leap stays clear of everything in its way, and of the top of the screen. */
  private clearArc(from: Spot, to: Spot, fromX: number, toX: number): boolean {
    const { height } = this.world.body;
    const lift = liftOf(Math.abs(toX - fromX), from.platform.y - to.platform.y, height);
    const top = Math.min(from.platform.y, to.platform.y) - lift - height;
    if (top < 0) return false;
    for (let sample = 1; sample < ARC_SAMPLES; sample++) {
      const along = sample / ARC_SAMPLES;
      const x = fromX + (toX - fromX) * along;
      const y = from.platform.y + (to.platform.y - from.platform.y) * along - lift * 4 * along * (1 - along) - height / 2;
      const inTheWay = this.world.surfaces.some(surface => {
        if (surface.id === from.platform.id && along < 0.3) return false;
        if (surface.id === to.platform.id && along > 0.7) return false;
        return x >= surface.x && x <= surface.x + surface.width && y >= surface.y && y <= surface.y + surface.height;
      });
      if (inTheWay) return false;
    }
    return true;
  }

  private dropOff(from: Spot, direction: number): Move | null {
    const { world } = this;
    const end = direction > 0 ? from.span.right : from.span.left;
    const ledge = world.ledge(from.platform, from.span, direction);
    if (ledge.kind !== 'drop') return null;
    const toX = end + direction * world.body.width;
    const landing = world.landing(toX, from.platform.y + 1, world.bottom);
    const to = landing && this.spotAt(landing, toX);
    return to ? { kind: 'drop', from, to, fromX: end, toX, side: direction } : null;
  }

  private climb(from: Spot, direction: number): Move | null {
    const { world } = this;
    const end = direction > 0 ? from.span.right : from.span.left;
    const ledge = world.ledge(from.platform, from.span, direction);
    if (ledge.kind === 'drop') return null;
    const top = ledge.kind === 'wall' ? world.find(ledge.surface.id) : null;
    const toX = ledge.kind === 'wall' ? (direction > 0 ? ledge.surface.x : ledge.surface.x + ledge.surface.width) + direction * world.body.width : end;
    const to = top && this.nearestSpot(top, toX);
    if (to) return { kind: 'climb', from, to, fromX: end, toX: clamp(toX, to.span), side: direction };
    return { kind: 'cling', from, to: from, fromX: end, toX: end, side: direction };
  }

  private nearestSpot(platform: Platform, x: number): Spot | null {
    const reach = this.world.body.width * 2;
    const spots = this.spots.filter(spot => spot.platform === platform && Math.abs(clamp(x, spot.span) - x) <= reach);
    return spots[0] ?? null;
  }

  movesFrom(from: Spot): readonly Move[] {
    let moves = this.movesBySpot.get(from);
    if (!moves) this.movesBySpot.set(from, moves = this.findMoves(from));
    return moves;
  }

  private findMoves(from: Spot): Move[] {
    const { flies, jumps, climbs, walks } = this.abilities;
    const reach = jumps * this.world.body.height;
    const others = this.spots.filter(spot => spot !== from);
    const moves: (Move | null)[] = [];
    if (flies) for (const to of others) moves.push({ kind: 'fly', from, to, fromX: clamp(to.span.left, from.span), toX: (to.span.left + to.span.right) / 2, side: 0 });
    if (!walks) return moves as Move[];
    if (reach) for (const to of others) moves.push(this.jumpBetween(from, to, reach));
    for (const direction of [-1, 1]) {
      moves.push(this.dropOff(from, direction));
      if (climbs) moves.push(this.climb(from, direction));
    }
    return moves.filter(move => move !== null);
  }

  /** Everywhere reachable from a spot in a few moves, each by the shortest way. */
  routesFrom(start: Spot): Route[] {
    const routes = new Map<Spot, Route>([[start, { spot: start, moves: [] }]]);
    let frontier: Route[] = [routes.get(start)!];
    for (let depth = 0; depth < MOST_MOVES_ON_A_ROUTE; depth++) {
      const next: Route[] = [];
      for (const { spot, moves } of frontier) {
        for (const move of this.movesFrom(spot)) {
          if (move.kind === 'cling' || routes.has(move.to)) continue;
          const route = { spot: move.to, moves: [...moves, move] };
          routes.set(move.to, route);
          next.push(route);
        }
      }
      frontier = next;
    }
    return [...routes.values()];
  }
}
