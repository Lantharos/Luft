import type { Sprite, SpriteOptions, SpriteSheet, Sprites } from '@luft/extension-api';

import type { Pointer } from '../playground/pointers.js';

export type Kind = 'lantern' | 'cloud' | 'campfire' | 'stars';

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Sheets {
  lantern: SpriteSheet;
  tassel: SpriteSheet;
  cloud: SpriteSheet;
  flame: SpriteSheet;
  logs: SpriteSheet;
  glow: SpriteSheet;
  star: SpriteSheet;
  small: SpriteSheet;
  comet: SpriteSheet;
}

/** How far a thing can reach without touching another display, Infinity where there's none beside this one. */
export interface Limit {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** What a thing needs of the place it lives in. */
export interface Stand {
  readonly sprites: Sprites;
  readonly sheets: Sheets;
  /** The display it's on. */
  readonly display: number;
  /** What the display is known by when it comes back. */
  readonly displayId: string;
  /** Where things can be: the display without the taskbar. */
  readonly room: Box;
  /** Where it stops, so that what it does never repaints the next display. */
  readonly limit: Limit;
  /** How big things are, 1 for the middle size. */
  readonly size: number;
  /** Whether things should stay still when pushed around: they still respond, only without motion. */
  readonly calm: () => boolean;
  /** Says what screen readers call a part people can press. */
  readonly label: (kind: Kind) => string;
}

/** Something on the desktop: a few sprites and what makes them move. */
export abstract class Thing {
  protected readonly parts: Sprite[] = [];
  private readonly pressable = new Set<Sprite>();

  protected constructor(readonly id: string, readonly kind: Kind, protected readonly stand: Stand) {}

  get display(): number {
    return this.stand.display;
  }

  get room(): Box {
    return this.stand.room;
  }

  get displayId(): string {
    return this.stand.displayId;
  }

  protected part(sheet: SpriteSheet, height: number, options: Partial<SpriteOptions> = {}): Sprite {
    const sprite = this.stand.sprites.add({ sheet, height, smooth: true, display: this.stand.display, ...options });
    this.parts.push(sprite);
    if (options.pressable) {
      this.pressable.add(sprite);
      sprite.describe(this.stand.label(this.kind));
    }
    return sprite;
  }

  /** Moves a point in by as much as a thing `halfWidth` wide and `halfHeight` tall needs to stay on its display. */
  protected kept({ x, y }: Point, halfWidth: number, halfHeight: number): Point {
    const { left, top, right, bottom } = this.stand.limit;
    return { x: Math.min(right - halfWidth, Math.max(left + halfWidth, x)), y: Math.min(bottom - halfHeight, Math.max(top + halfHeight, y)) };
  }

  /** How much to shrink a round glow here so it stays on its display. */
  protected fitted({ x, y }: Point, radius: number): number {
    const { left, top, right, bottom } = this.stand.limit;
    return Math.min(1, Math.min(x - left, right - x, y - top, bottom - y) / radius);
  }

  owns(sprite: Sprite): boolean {
    return this.pressable.has(sprite);
  }

  /** Where it shows, for knowing when windows cover it. */
  abstract get bounds(): Box;
  /** Where the pointer counts, around {@link bounds}. */
  abstract get reach(): Box;
  /** Where it is, as people place it. */
  abstract get home(): Point;
  /** Puts it somewhere else at once. */
  abstract moveTo(point: Point): void;

  /** Where people hold it while arranging. */
  abstract get grip(): Point;

  /** Moves on by `seconds` to `time`, with the pointers that are near. Returns whether it's still moving. */
  abstract step(seconds: number, time: number, pointers: readonly Pointer[]): boolean;
  /** Works out where ambient motion puts it at `time`, in seconds. */
  abstract breathe(time: number): void;
  /** Shows it as it is now. */
  abstract draw(): void;
  /** Stops all motion and shows it at rest. */
  abstract rest(): void;

  /** A press came down on it. */
  abstract grabbed(pointer: Pointer): void;
  /** A press lets go of it. Short ones without much movement are clicks and tap it. */
  abstract released(pointer: Pointer, clicked: boolean): void;

  /** A click landed on the bare desktop near it. The desktop has it, but a thing can still notice. */
  tappedNear(_pointer: Pointer): void {}

  dispose(): void {
    for (const part of this.parts.splice(0)) part.dispose();
  }
}

export const expanded = ({ x, y, width, height }: Box, margin: number): Box => ({ x: x - margin, y: y - margin, width: width + margin * 2, height: height + margin * 2 });
export const inside = ({ x, y, width, height }: Box, pointX: number, pointY: number) => pointX >= x && pointX < x + width && pointY >= y && pointY < y + height;
