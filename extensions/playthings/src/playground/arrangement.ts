import type { DesktopPointerEvent, Extension, Popup, Sprite, Sprites } from '@luft/extension-api';

import type { Box, Point, Sheets, Thing } from '../things/thing.js';
import type { Places } from './places.js';
import type { Pointer } from './pointers.js';

type Granted = 'wallpaper' | 'popups';

interface Carried {
  thing: Thing;
  offsetX: number;
  offsetY: number;
}

const RING = 132;
const RING_FRAME = 5;

const within = ({ x, y, width, height }: Box, point: Point): Point => ({ x: Math.min(x + width, Math.max(x, point.x)), y: Math.min(y + height, Math.max(y, point.y)) });

/** Lets people move things: they come out above the windows until they're done, and each one stays where it's dropped. */
export class Arrangement {
  private popup: Popup | null = null;
  private lifted: Sprites | null = null;
  private rings = new Map<Thing, Sprite>();
  private readonly carried = new Map<number, Carried>();

  constructor(private readonly extension: Extension<Granted>, private readonly places: Places, private readonly things: () => readonly Thing[],
    private readonly reset: () => void, private readonly started: () => void, private readonly ended: () => void) {}

  get active(): boolean {
    return !!this.popup;
  }

  begin(sprites: Sprites, sheets: Sheets): void {
    if (this.popup) return;
    const { popups, t } = this.extension;
    this.popup = popups.open({
      anchor: 'top', kind: 'window', title: t('arrange'), width: 320,
      content: {
        type: 'column', children: [
          { type: 'text', text: t('arrange-hint') },
          { type: 'row', align: 'end', children: [
            { type: 'button', label: t('arrange-reset'), onActivate: this.reset },
            { type: 'button', label: t('arrange-done'), style: 'primary', onActivate: () => this.finish() },
          ] },
        ],
      },
      onClosed: () => this.finish(),
    });
    sprites.lift(true);
    this.lifted = sprites;
    for (const thing of this.things()) {
      thing.rest();
      const ring = sprites.add({ sheet: sheets.glow, height: RING, smooth: true, pivot: [0.5, 0.5] });
      this.rings.set(thing, ring);
      this.showRing(thing);
    }
    this.started();
  }

  private showRing(thing: Thing): void {
    const { x, y } = thing.grip;
    this.rings.get(thing)!.place({ display: thing.display, x, y, frame: RING_FRAME, opacity: 0.5 });
  }


  finish(): void {
    if (!this.popup) return;
    const popup = this.popup;
    this.popup = null;
    this.carried.clear();
    for (const ring of this.rings.values()) ring.dispose();
    this.rings.clear();
    this.lifted?.lift(false);
    popup.dispose();
    this.ended();
  }

  felt({ phase, id, sprite }: DesktopPointerEvent, pointer: Pointer, ownerOf: (sprite: Sprite) => Thing | null): void {
    if (phase === 'down' && sprite) {
      const thing = ownerOf(sprite);
      if (thing) this.carried.set(id, { thing, offsetX: thing.home.x - pointer.x, offsetY: thing.home.y - pointer.y });
      return;
    }
    const carried = this.carried.get(id);
    if (!carried) return;
    const { thing, offsetX, offsetY } = carried;
    const point = pointer.display === thing.display ? within(thing.room, { x: pointer.x + offsetX, y: pointer.y + offsetY }) : thing.home;
    thing.moveTo(point);
    this.showRing(thing);
    if (phase === 'move') return;
    this.carried.delete(id);
    this.places.put(thing.displayId, thing.id, point, thing.room);
  }
}
