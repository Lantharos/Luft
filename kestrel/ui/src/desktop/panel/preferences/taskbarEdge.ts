import Mtk from 'gi://Mtk';
import type Shell from 'gi://Shell';
import type St from 'gi://St';

import { toneOf, type Rgb } from '../../../appearance/color.js';
import { isVertical } from '../../../shared/layout/edge.js';
import { SURFACE_GAP } from '../../../shared/layout/surface.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';
import { WindowOverlap } from '../autoHide/windowOverlap.js';
import { taskbarBackdrops } from '../backdrop.js';
import type { TaskbarLayout } from './taskbarPreferences.js';

type Span = [number, number];

const BRIGHT_TONE = 62;
const LIFT = 0.32;
const DIM = 0.25;
const DARKEST = 1;
const MAX_SPANS = 4;
const RESTING_REACH = 2 * SURFACE_GAP + 1;

const watchers = new Set<() => void>();
let overlap: WindowOverlap | null = null;

function watchWindows(changed: () => void): () => void {
  watchers.add(changed);
  overlap ??= new WindowOverlap(() => watchers.forEach(watcher => watcher()));
  return () => {
    watchers.delete(changed);
    if (watchers.size) return;
    overlap?.destroy();
    overlap = null;
  };
}

const luma = ([red, green, blue]: Rgb) => 0.2126 * red + 0.7152 * green + 0.0722 * blue;

function shadeOver(behind: Rgb, luca: Rgb): [lift: number, dim: number] {
  const change = (toneOf(luca) > BRIGHT_TONE ? -DIM : LIFT) * luma(luca) / Math.max(luma(behind), DARKEST);
  return change > 0 ? [change, 0] : [0, -change];
}

function merged(spans: Span[]): Span[] {
  const joined = spans.sort(([a], [b]) => a - b).reduce<Span[]>((all, [start, end]) => {
    const last = all.at(-1);
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else all.push([start, end]);
    return all;
  }, []);
  while (joined.length > MAX_SPANS) {
    const narrowest = joined.slice(1).reduce((best, [start], index) => start - joined[index][1] < joined[best + 1][0] - joined[best][1] ? index : best, 0);
    joined.splice(narrowest, 2, [joined[narrowest][0], joined[narrowest + 1][1]]);
  }
  return joined;
}

export class TaskbarEdge {
  private unwatchWindows: (() => void) | null = null;
  private shade: [lift: number, dim: number] = [LIFT, 0];

  constructor(private readonly actor: St.Widget, private readonly effect: Shell.BlurEffect, private readonly screen: () => TaskbarLayout) {
    const unwatchFloor = wallpaperFloor.watch(() => this.sync());
    actor.connect('notify::allocation', () => this.follow());
    actor.connect('style-changed', () => this.sync());
    actor.connect('destroy', () => {
      unwatchFloor();
      this.unwatchWindows?.();
    });
  }

  sync(): void {
    if (this.screen().style !== 'bar') {
      this.unwatchWindows?.();
      this.unwatchWindows = null;
      this.effect.clear_outline_shade();
      return;
    }
    const [behind] = taskbarBackdrops(this.actor, wallpaperFloor);
    const [luca] = taskbarBackdrops(this.actor, wallpaperFloor, 'luca');
    this.shade = behind ? shadeOver(behind, luca) : [LIFT, 0];
    this.unwatchWindows ??= watchWindows(() => this.follow());
    this.follow();
  }

  private follow(): void {
    const parent = this.actor.get_parent();
    if (!overlap || !this.unwatchWindows || !parent) return;
    const edge = this.screen().edge;
    const across = isVertical(edge);
    const { x1, y1, x2, y2 } = this.actor.get_allocation_box();
    const [left, top] = parent.get_transformed_position();
    const reach = { bottom: [0, -RESTING_REACH, 0, 0], top: [0, 0, 0, RESTING_REACH], left: [0, 0, RESTING_REACH, 0], right: [-RESTING_REACH, 0, 0, 0] }[edge];
    const area = new Mtk.Rectangle({
      x: Math.round(left + x1 + reach[0]),
      y: Math.round(top + y1 + reach[1]),
      width: Math.round(x2 - x1 + reach[2] - reach[0]),
      height: Math.round(y2 - y1 + reach[3] - reach[1]),
    });
    const origin = across ? area.y : area.x;
    const length = across ? y2 - y1 : x2 - x1;
    const spans = overlap.touching(area).map(({ x, y, width, height }): Span => across
      ? [Math.max(0, y - origin), Math.min(length, y + height - origin)]
      : [Math.max(0, x - origin), Math.min(length, x + width - origin)]);
    this.effect.set_outline_shade(...this.shade, merged(spans).flat());
  }
}
