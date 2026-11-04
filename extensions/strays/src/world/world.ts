import type { Surface, SurfaceDisplay } from '@luft/extension-api';

export interface Span {
  left: number;
  right: number;
}

/** Something strays can stand on: the top of a window, the taskbar or the bottom of the screen. */
export interface Platform extends Span {
  id: string;
  y: number;
  radiusLeft: number;
  radiusRight: number;
  kind: PlatformKind;
  /** Where a stray fits, by the middle of its feet: no other window or piece of the taskbar is in the way or above. */
  open: readonly Span[];
}

export type PlatformKind = 'window' | 'taskbar' | 'ground';

export type Ledge =
  | { kind: 'drop' }
  | { kind: 'wall'; surface: Surface }
  | { kind: 'screen' };

/** How much room a stray takes up. */
export interface Body {
  width: number;
  height: number;
}

const FLOOR = 'floor';
const TOUCHING = 2;

function subtract(spans: readonly Span[], { left, right }: Span): Span[] {
  return spans.flatMap(span => {
    if (right <= span.left || left >= span.right) return [span];
    return [
      ...left > span.left ? [{ left: span.left, right: left }] : [],
      ...right < span.right ? [{ left: right, right: span.right }] : [],
    ];
  });
}

const covering = (surfaces: readonly Surface[], id: string, y: number, height: number) =>
  surfaces.filter(surface => surface.id !== id && surface.y < y && surface.y + surface.height > y - height);

/** What strays can stand on and walk along on one display, worked out from where windows and the taskbar are. */
export class World {
  readonly platforms: readonly Platform[];
  readonly surfaces: readonly Surface[];

  constructor(readonly display: SurfaceDisplay, readonly body: Body) {
    this.surfaces = [...display.taskbar, ...display.windows];
    const taskbar = new Set(display.taskbar.map(({ id }) => id));
    const platforms = this.surfaces
      .filter(({ y }) => y > 0)
      .map(surface => this.platform(surface.id, surface.x, surface.x + surface.width, surface.y, surface.radii[0], surface.radii[1], taskbar.has(surface.id) ? 'taskbar' : 'window'));
    this.platforms = [...platforms, this.platform(FLOOR, 0, display.width, display.height, 0, 0, 'ground')].sort((one, other) => one.y - other.y);
  }

  private platform(id: string, left: number, right: number, y: number, radiusLeft: number, radiusRight: number, kind: PlatformKind): Platform {
    const half = this.body.width / 2;
    const whole = [{ left: Math.max(left, half), right: Math.min(right, this.display.width - half) }].filter(span => span.right > span.left);
    const fits = y - this.body.height >= 0;
    const open = covering(this.surfaces, id, y, this.body.height)
      .reduce((spans, { x, width }) => subtract(spans, { left: x - half, right: x + width + half }), fits ? whole : []);
    return { id, left, right, y, radiusLeft, radiusRight, kind, open };
  }

  find(id: string): Platform | null {
    return this.platforms.find(platform => platform.id === id) ?? null;
  }

  /** The surface's height under `x`, following its rounded corners. */
  heightAt(platform: Platform, x: number): number {
    const dip = (radius: number, inset: number) => inset >= radius ? 0 : radius - Math.sqrt(Math.max(0, radius ** 2 - (radius - inset) ** 2));
    return platform.y + Math.max(dip(platform.radiusLeft, x - platform.left), dip(platform.radiusRight, platform.right - x));
  }

  spanAt(platform: Platform, x: number): Span | null {
    return platform.open.find(({ left, right }) => x >= left && x <= right) ?? null;
  }

  /** The closest place on `platform` where a stray at `x` fits, if one is within `reach`. */
  nearestOpen(platform: Platform, x: number, reach: number): number | null {
    let nearest: number | null = null;
    for (const { left, right } of platform.open) {
      const place = Math.min(right, Math.max(left, x));
      if (Math.abs(place - x) <= reach && (nearest === null || Math.abs(place - x) < Math.abs(nearest - x))) nearest = place;
    }
    return nearest;
  }

  /** What's at the end of a span in a direction. */
  ledge(platform: Platform, span: Span, direction: number): Ledge {
    const half = this.body.width / 2;
    const end = direction > 0 ? span.right : span.left;
    const surface = covering(this.surfaces, platform.id, platform.y, this.body.height)
      .find(({ x, width }) => Math.abs((direction > 0 ? x - half : x + width + half) - end) <= TOUCHING);
    if (surface) return { kind: 'wall', surface };
    return end <= half + TOUCHING || end >= this.display.width - half - TOUCHING ? { kind: 'screen' } : { kind: 'drop' };
  }

  /** The first platform a stray falling at `x` from `from` to `to` meets. */
  landing(x: number, from: number, to: number): Platform | null {
    return this.platforms.find(platform => {
      const y = this.heightAt(platform, x);
      return y >= from && y <= to && !!this.spanAt(platform, x);
    }) ?? null;
  }

  /** Where a stray ends up for sure: on the ground in the open if there's room, or else out of sight behind a window. */
  resting(x: number): { platform: Platform; x: number } {
    const ground = this.platforms.filter(platform => platform.kind !== 'window');
    const places = ground.flatMap(platform => {
      const place = this.nearestOpen(platform, x, Infinity);
      return place === null ? [] : [{ platform, x: place }];
    });
    const closest = places.sort((one, other) => Math.abs(one.x - x) - Math.abs(other.x - x))[0];
    if (closest) return closest;
    const [highest] = ground;
    return { platform: highest, x: Math.min(highest.right, Math.max(highest.left, x)) };
  }

  /** The topmost window under a point, if it's on a window. */
  windowAt(x: number, y: number): Platform | null {
    const window = this.display.windows.find(surface => x >= surface.x && x < surface.x + surface.width && y >= surface.y && y < surface.y + surface.height);
    return window ? this.find(window.id) : null;
  }

  /** The bottom of everything on this display: nothing falls further. */
  get bottom(): number {
    return this.display.height;
  }
}
