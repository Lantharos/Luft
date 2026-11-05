import type { Storage } from '@luft/extension-api';

import type { Box, Kind, Point } from '../things/thing.js';

const STORED = 'places';
const SPANS: Record<string, readonly [number, number]> = { left: [0.07, 0.3], middle: [0.38, 0.62], right: [0.7, 0.93], across: [0.08, 0.92] };
const CLOUD_INSET = 0.16;
const HEIGHTS: Record<Kind, readonly number[]> = {
  lantern: [0.3, 0.44, 0.22, 0.36, 0.26, 0.48, 0.18],
  cloud: [0.14, 0.22, 0.09, 0.28, 0.17, 0.11],
  campfire: [0.985, 0.985, 0.985],
  stars: [0.36, 0.2, 0.44, 0.28],
};

type Spots = Record<string, Record<string, [number, number]>>;

export const thingId = (kind: Kind, slot: number) => `${kind}-${slot}`;

/** Where things go on each display: where people put them, or else where the settings say. Kept as parts of the room, so they follow a display that changes size. */
export class Places {
  constructor(private readonly storage: Storage) {}

  private get spots(): Spots {
    return this.storage.get<Spots>(STORED) ?? {};
  }

  /** Where one of `count` things of a kind goes by default, spread along the part of the room people chose. */
  private chosen(kind: Kind, slot: number, count: number, place: string, room: Box): Point {
    const [left, right] = SPANS[place];
    const [from, to] = kind === 'cloud' ? [Math.max(left, CLOUD_INSET), Math.min(right, 1 - CLOUD_INSET)] : [left, right];
    const across = count === 1 ? (from + to) / 2 : from + (to - from) * slot / (count - 1);
    const heights = HEIGHTS[kind];
    return { x: room.x + room.width * across, y: room.y + room.height * heights[slot % heights.length] };
  }

  of(display: string, kind: Kind, slot: number, count: number, place: string, room: Box): Point {
    const spot = this.spots[display]?.[thingId(kind, slot)];
    if (!spot) return this.chosen(kind, slot, count, place, room);
    return { x: room.x + spot[0] * room.width, y: room.y + spot[1] * room.height };
  }

  put(display: string, id: string, { x, y }: Point, room: Box): void {
    const spots = this.spots;
    this.storage.set(STORED, { ...spots, [display]: { ...spots[display], [id]: [(x - room.x) / room.width, (y - room.y) / room.height] } });
  }

  /** Forgets where people put things, of one kind or all of them. */
  forget(kind?: Kind): void {
    if (!kind) {
      this.storage.delete(STORED);
      return;
    }
    const kept = Object.entries(this.spots).map(([display, spots]) => [display, Object.fromEntries(Object.entries(spots).filter(([id]) => !id.startsWith(`${kind}-`)))]);
    this.storage.set(STORED, Object.fromEntries(kept));
  }
}
