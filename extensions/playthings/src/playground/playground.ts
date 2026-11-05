import type { DesktopPointerEvent, Disposable, Extension, PointerFollow, Sprite, Sprites, SurfaceDisplay } from '@luft/extension-api';

import { Campfire } from '../things/campfire.js';
import { Cloud } from '../things/cloud.js';
import { Lantern, type Paper, PAPERS } from '../things/lantern.js';
import { Stars } from '../things/stars.js';
import { inside, type Kind, type Sheets, type Stand, type Thing } from '../things/thing.js';
import { Arrangement } from './arrangement.js';
import { coveredBy } from './covered.js';
import { Places, thingId } from './places.js';
import { Pointer } from './pointers.js';
import { sheetShelf } from './shelf.js';

type Granted = 'wallpaper' | 'popups';

const AMBIENT_RATE_MS = 83;
const SURFACES_QUIET_MS = 240;
const POINTER_STILL = 4;
const SHORTEST_FRAME_S = 0.002;
const SIZES: Record<string, number> = { small: 0.72, medium: 1, large: 1.36 };
const KINDS: { kind: Kind; on: string; count: string; place: string }[] = [
  { kind: 'cloud', on: 'clouds', count: 'cloud-count', place: 'cloud-place' },
  { kind: 'stars', on: 'stars', count: 'star-count', place: 'star-place' },
  { kind: 'lantern', on: 'lanterns', count: 'lantern-count', place: 'lantern-place' },
  { kind: 'campfire', on: 'campfire', count: 'campfire-count', place: 'campfire-place' },
];

const labelOf = (t: Extension['t']) => (kind: Kind) => ({ lantern: t('label-lantern'), cloud: t('label-cloud'), campfire: t('label-campfire'), stars: t('label-stars') })[kind];
const stampOf = (displays: readonly SurfaceDisplay[]) => JSON.stringify(displays.map(({ id, index, width, height, workArea }) => [id, index, width, height, workArea]));

/** Everything on the desktop: it builds things from the settings and decides which of them run, and how often. */
export class Playground {
  readonly places: Places;
  readonly arrangement: Arrangement;
  private things: Thing[] = [];
  private sprites: Sprites | null = null;
  private sheets: Sheets | null = null;
  private follow: PointerFollow | null = null;
  private readonly awake = new Set<Thing>();
  private readonly hidden = new Set<Thing>();
  private readonly pointers = new Map<number, Pointer>();
  private readonly holds = new Map<number, Thing>();
  private stepping: Disposable | null = null;
  private breathing: Disposable | null = null;
  private quieting: Disposable | null = null;
  private stamp = '';

  constructor(private readonly extension: Extension<Granted>, private readonly thingsChanged: () => void) {
    this.places = new Places(extension.storage);
    this.arrangement = new Arrangement(extension, this.places, () => this.things, () => this.resetPlaces(), () => this.conditionsChanged(), () => this.arranged());
    const { desktop, power, appearance, wallpaper } = extension;
    for (const source of [desktop, power, appearance]) source.onChanged(() => this.conditionsChanged());
    wallpaper.onSurfacesChanged(() => this.surfacesMoved());
  }

  get count(): number {
    return this.things.length;
  }

  private get time(): number {
    return Date.now() / 1000 % 86400;
  }

  private get canMove(): boolean {
    return this.extension.desktop.wallpaperVisible && !this.arrangement.active;
  }

  private get canBreathe(): boolean {
    const { settings, power, appearance } = this.extension;
    return this.canMove && settings.get<boolean>('ambient') && !appearance.reducedMotion && !power.saving && this.things.some(thing => !this.hidden.has(thing));
  }

  /** Lets people move things by hand. */
  arrange(): void {
    if (!this.sprites) return;
    this.stopMoving();
    this.arrangement.begin(this.sprites, this.sheets!);
  }

  /** Puts everything back where the settings say. */
  resetPlaces(): void {
    this.places.forget();
    this.build();
  }

  /** Puts on the desktop what the settings ask for, and takes everything else away. */
  build(): void {
    this.clear();
    const { settings, wallpaper } = this.extension;
    const displays = wallpaper.surfaces;
    this.stamp = stampOf(displays);
    if (!settings.get<boolean>('on')) return;
    const wanted = KINDS.filter(({ on }) => settings.get<boolean>(on));
    if (!wanted.length) return;
    const sprites = this.sprites = wallpaper.addSprites();
    const sheets = this.sheets = sheetShelf(sprites);
    const size = SIZES[settings.get<string>('size')];
    const shown = settings.get<string>('displays') === 'every' ? displays : displays.filter(({ primary }) => primary);
    for (const display of shown) {
      const stand: Stand = {
        sprites, sheets, size,
        display: display.index,
        displayId: display.id,
        room: display.workArea,
        calm: () => this.extension.appearance.reducedMotion,
        label: labelOf(this.extension.t),
      };
      for (const { kind, count, place } of wanted) {
        const amount = settings.get<number>(count);
        for (let slot = 0; slot < amount; slot++) {
          const thing = this.make(kind, slot, stand);
          thing.moveTo(this.places.of(display.id, kind, slot, amount, settings.get<string>(place), display.workArea));
          this.things.push(thing);
        }
      }
    }
    this.seeWhatShows();
    this.follow = wallpaper.followPointer({ areas: this.areas(), onPointer: event => this.pointerMoved(event) });
    this.syncBreathing();
    this.thingsChanged();
  }

  private make(kind: Kind, slot: number, stand: Stand): Thing {
    const id = thingId(kind, slot);
    switch (kind) {
      case 'lantern': return new Lantern(id, stand, this.paperOf(slot), slot);
      case 'cloud': return new Cloud(id, stand, slot);
      case 'campfire': return new Campfire(id, stand, slot);
      case 'stars': return new Stars(id, stand, slot);
    }
  }

  private paperOf(slot: number): Paper {
    const paper = this.extension.settings.get<string>('lantern-paper');
    return paper === 'mixed' ? PAPERS[slot % PAPERS.length] : paper as Paper;
  }

  private clear(): void {
    this.arrangement.finish();
    this.stepping?.dispose();
    this.stepping = null;
    this.breathing?.dispose();
    this.breathing = null;
    this.follow?.dispose();
    this.follow = null;
    this.awake.clear();
    this.hidden.clear();
    this.holds.clear();
    this.pointers.clear();
    for (const thing of this.things) thing.dispose();
    this.things = [];
    this.sprites?.dispose();
    this.sprites = this.sheets = null;
  }

  private areas() {
    return this.things.filter(thing => !this.hidden.has(thing)).map(thing => ({ display: thing.display, ...thing.reach }));
  }

  private setAreas(): void {
    this.follow?.setAreas(this.areas());
  }

  private placesChanged(): void {
    this.seeWhatShows();
    this.setAreas();
    this.syncBreathing();
  }

  private arranged(): void {
    if (this.things.length) this.placesChanged();
  }

  /** Windows moved: looks again once they stop, not on every frame of a drag. */
  private surfacesMoved(): void {
    if (!this.things.length) return;
    this.quieting?.dispose();
    this.quieting = this.extension.timers.timeout(SURFACES_QUIET_MS, () => {
      this.quieting = null;
      const displays = this.extension.wallpaper.surfaces;
      if (stampOf(displays) !== this.stamp) this.build();
      else this.placesChanged();
    });
  }

  private seeWhatShows(): void {
    const displays = this.extension.wallpaper.surfaces;
    this.hidden.clear();
    for (const thing of this.things) {
      const display = displays.find(({ index }) => index === thing.display)!;
      if (display.fullscreen || coveredBy(thing.bounds, display.windows)) this.hidden.add(thing);
    }
  }

  private conditionsChanged(): void {
    if (!this.canMove) this.stopMoving();
    this.syncBreathing();
  }

  private stopMoving(): void {
    this.stepping?.dispose();
    this.stepping = null;
    this.holds.clear();
    for (const thing of this.awake) thing.rest();
    this.awake.clear();
  }

  private syncBreathing(): void {
    if (this.canBreathe === !!this.breathing) return;
    this.breathing?.dispose();
    this.breathing = this.canBreathe ? this.extension.timers.interval(AMBIENT_RATE_MS, () => this.breathe()) : null;
  }

  private breathe(): void {
    const { time } = this;
    for (const thing of this.things) {
      if (this.hidden.has(thing) || this.awake.has(thing)) continue;
      thing.breathe(time);
      thing.draw();
    }
  }

  private wake(thing: Thing): void {
    this.awake.add(thing);
    this.stepping ??= this.sprites!.onFrame(seconds => this.frame(seconds));
  }

  private frame(seconds: number): boolean {
    if (seconds < SHORTEST_FRAME_S) return true;
    const { time } = this;
    const breathing = !!this.breathing;
    const pointers = [...this.pointers.values()];
    for (const pointer of pointers) pointer.settle(seconds);
    for (const thing of this.awake) {
      if (breathing) thing.breathe(time);
      const reach = thing.reach;
      const near = pointers.filter(pointer => pointer.display === thing.display && inside(reach, pointer.x, pointer.y));
      const moving = thing.step(seconds, time, near) || near.some(({ speed }) => speed > POINTER_STILL);
      if (!moving && ![...this.holds.values()].includes(thing)) this.awake.delete(thing);
    }
    if (this.awake.size) return true;
    this.stepping = null;
    return false;
  }

  private ownerOf(sprite: Sprite): Thing | null {
    return this.things.find(thing => thing.owns(sprite)) ?? null;
  }

  private pointerMoved(event: DesktopPointerEvent): void {
    const pointer = this.pointers.get(event.id) ?? new Pointer(event.id, event);
    this.pointers.set(event.id, pointer);
    if (this.canMove) this.wakeAround(pointer);
    if (event.phase !== 'gone') pointer.moved(event);
    if (this.arrangement.active) this.arrangement.felt(event, pointer, this.ownerOf.bind(this));
    else if (this.canMove) this.felt(event, pointer);
    if (event.phase === 'gone' || (event.phase === 'up' && event.kind === 'touch')) this.pointers.delete(event.id);
  }

  private wakeAround(pointer: Pointer): void {
    for (const thing of this.things) {
      if (thing.display === pointer.display && inside(thing.reach, pointer.x, pointer.y)) this.wake(thing);
    }
  }

  private felt({ phase, sprite }: DesktopPointerEvent, pointer: Pointer): void {
    this.wakeAround(pointer);
    if (phase === 'down') {
      pointer.press();
      const thing = sprite && this.ownerOf(sprite);
      if (thing) {
        this.holds.set(pointer.id, thing);
        thing.grabbed(pointer);
        this.wake(thing);
      }
    } else if (phase === 'up') {
      const clicked = pointer.release();
      const held = this.holds.get(pointer.id);
      held?.released(pointer, clicked);
      this.holds.delete(pointer.id);
      if (clicked && !held) for (const thing of this.things) if (thing.display === pointer.display) thing.tappedNear(pointer);
    } else if (phase === 'gone') {
      pointer.release();
      this.holds.get(pointer.id)?.released(pointer, false);
      this.holds.delete(pointer.id);
    }
  }
}
