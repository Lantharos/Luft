import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GdkPixbuf from 'gi://GdkPixbuf';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { Scope } from '../../../runtime/scope.js';
import type { Sprite, SpriteOptions, SpritePlace, SpritePoint, SpriteSheet, SpriteSheetOptions } from '../types.js';
import { WindowRide } from './ride.js';
import type { LayerStage } from './stage.js';
import { windowWithId } from './surfaces.js';

const DRAG_THRESHOLD = 6;

/** What a frame covers: the box around its pixels that show, as parts of the frame's width and height. */
interface Covered {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A frame as it's drawn and facing the other way, and what shows of it in each. */
interface Mirrored {
  images: readonly [St.ImageContent, St.ImageContent];
  covered: readonly [Covered, Covered];
}

const VISIBLE_ALPHA = 32;

function coveredBy(pixels: Uint8Array, cell: number): Covered {
  let [left, top, right, bottom] = [cell, cell, 0, 0];
  for (let y = 0; y < cell; y++) {
    for (let x = 0; x < cell; x++) {
      if (pixels[(y * cell + x) * 4 + 3] < VISIBLE_ALPHA) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + 1);
      bottom = Math.max(bottom, y + 1);
    }
  }
  return { left: left / cell, top: top / cell, right: right / cell, bottom: bottom / cell };
}

/** A sprite on the desktop, which only takes clicks on what shows of it, so the desktop keeps the rest of its square. */
const SpriteActor = GObject.registerClass(class ExtensionSprite extends Clutter.Actor {
  covered: Covered = { left: 0, top: 0, right: 1, bottom: 1 };

  vfunc_pick(context: Clutter.PickContext): void {
    if (!this.should_pick(context)) return;
    const { left, top, right, bottom } = this.covered;
    const { width, height } = this;
    this.pick_box(context, new Clutter.ActorBox({ x1: left * width, y1: top * height, x2: right * width, y2: bottom * height }));
  }
});

function content(context: Cogl.Context, pixels: Uint8Array, cell: number): St.ImageContent {
  const image = St.ImageContent.new_with_preferred_size(cell, cell) as St.ImageContent;
  image.set_data(context, pixels, Cogl.PixelFormat.RGBA_8888, cell, cell, cell * 4);
  return image;
}

function cutFrames({ path, cell }: SpriteSheetOptions): { sheet: SpriteSheet; frames: Mirrored[] } {
  const loaded = GdkPixbuf.Pixbuf.new_from_file(path);
  const picture = loaded.get_has_alpha() ? loaded : loaded.add_alpha(false, 0, 0, 0)!;
  const columns = picture.width / cell;
  const rows = picture.height / cell;
  if (!Number.isInteger(columns) || !Number.isInteger(rows)) throw new Error(`${path} isn't a whole number of ${cell} pixel frames`);
  const context = global.stage.context.get_backend().get_cogl_context();
  const pixels = picture.get_pixels();
  const frames = Array.from({ length: columns * rows }, (_, index): Mirrored => {
    const start = Math.floor(index / columns) * cell * picture.rowstride + (index % columns) * cell * 4;
    const tight = new Uint8Array(cell * cell * 4);
    const mirrored = new Uint8Array(cell * cell * 4);
    for (let row = 0; row < cell; row++) {
      const from = start + row * picture.rowstride;
      tight.set(pixels.subarray(from, from + cell * 4), row * cell * 4);
      for (let column = 0; column < cell; column++) {
        mirrored.set(pixels.subarray(from + column * 4, from + (column + 1) * 4), (row * cell + cell - 1 - column) * 4);
      }
    }
    return { images: [content(context, tight, cell), content(context, mirrored, cell)], covered: [coveredBy(tight, cell), coveredBy(mirrored, cell)] };
  });
  return { sheet: Object.freeze({ columns, rows, cell }), frames };
}

const pointerPosition = (event: Clutter.Event): [number, number] => {
  const [x, y] = event.get_coords();
  return [x, y];
};

/** One sprite: an actor that shows a frame of its sheet, and that a person can carry around. */
class DesktopSprite {
  readonly actor: InstanceType<typeof SpriteActor>;
  private place_: SpritePlace | null = null;
  private zoom = 0;
  private grab: Clutter.Grab | null = null;
  private captured = 0;
  private pressed: [number, number] = [0, 0];
  private held: [number, number] | null = null;
  private shown = true;
  private ride: WindowRide | null = null;

  constructor(private readonly options: SpriteOptions, private readonly frames: readonly Mirrored[], name: string,
    private readonly stage: LayerStage, private readonly scope: Scope) {
    this.actor = new SpriteActor({ name, reactive: !!(options.onClick || options.onPicked), visible: false });
    this.actor.set_content_scaling_filters(Clutter.ScalingFilter.NEAREST, Clutter.ScalingFilter.NEAREST);
    this.actor.connect('button-press-event', (_actor, event: Clutter.Event) => this.pressedOn(event));
    this.actor.connect('touch-event', (_actor, event: Clutter.Event) => this.pressedOn(event));
    stage.place(this.actor, 'below-windows');
  }

  private scaleOf(display: number): number {
    return global.display.get_monitor_scale(display);
  }

  private zoomOn(display: number): number {
    return Math.max(1, Math.round(this.options.height * this.scaleOf(display) / this.options.sheet.cell));
  }

  sizeOn(display: number): number {
    return this.options.sheet.cell * this.zoomOn(display) / this.scaleOf(display);
  }

  place(place: SpritePlace): void {
    const last = this.place_;
    this.place_ = place;
    if (this.held) return;
    const zoom = this.zoomOn(place.display);
    if (zoom !== this.zoom) {
      this.zoom = zoom;
      const size = this.sizeOn(place.display);
      this.actor.set_size(size, size);
    }
    if (last?.frame !== place.frame || !!last.flipped !== !!place.flipped) {
      const { images, covered } = this.frames[place.frame];
      const side = place.flipped ? 1 : 0;
      this.actor.set_content(images[side]);
      this.actor.covered = covered[side];
    }
    if (place.on) this.standOn(place, place.on);
    else if (this.ride) this.stepOff(place);
    else if (last?.display !== place.display || last.x !== place.x || last.y !== place.y) this.move(place);
    this.actor.visible = this.shown;
  }

  /** Shows it, once it has a place, or keeps it out of the way while the wallpaper doesn't show. */
  show(shown: boolean): void {
    this.shown = shown;
    this.actor.visible = shown && !!this.place_;
  }

  private standOn(place: SpritePlace, id: string): void {
    const window = windowWithId(id);
    if (!window) return;
    if (this.ride?.window !== window) {
      this.ride?.stop();
      this.ride = new WindowRide(window, this.actor, this.stage.host.windowPicture);
    }
    const size = this.sizeOn(place.display);
    this.ride.place(place.x - size / 2, place.y - size, this.scaleOf(place.display));
  }

  private stepOff(place: SpritePlace): void {
    this.endRide();
    this.stage.place(this.actor, 'below-windows');
    this.move(place);
  }

  private endRide(): void {
    this.ride?.stop();
    this.ride = null;
  }

  private move({ display, x, y }: SpritePlace): void {
    const monitor = this.stage.monitors().find(({ index }) => index === display)!;
    const scale = this.scaleOf(display);
    const size = this.sizeOn(display);
    const snapped = (position: number) => Math.round(position * scale) / scale;
    this.actor.set_position(snapped(monitor.x + x - size / 2), snapped(monitor.y + y - size));
  }

  private pointOf(stageX: number, stageY: number): SpritePoint {
    const monitor = this.stage.host.monitorAt(stageX, stageY) ?? this.stage.monitors()[0];
    const [offsetX, offsetY] = this.held!;
    const size = this.actor.width;
    return { display: monitor.index, x: stageX - offsetX + size / 2 - monitor.x, y: stageY - offsetY + size - monitor.y };
  }

  private pressedOn(event: Clutter.Event): boolean {
    const type = event.type();
    const pressing = (type === Clutter.EventType.BUTTON_PRESS && event.get_button() === Clutter.BUTTON_PRIMARY) || type === Clutter.EventType.TOUCH_BEGIN;
    if (!pressing) return Clutter.EVENT_PROPAGATE;
    this.pressed = pointerPosition(event);
    this.grab = global.stage.grab(global.stage);
    this.captured = global.stage.connect('captured-event', (_stage, captured: Clutter.Event) => this.follow(captured));
    return Clutter.EVENT_STOP;
  }

  private follow(event: Clutter.Event): boolean {
    switch (event.type()) {
      case Clutter.EventType.MOTION:
      case Clutter.EventType.TOUCH_UPDATE:
        this.dragged(...pointerPosition(event));
        return Clutter.EVENT_STOP;
      case Clutter.EventType.BUTTON_RELEASE:
      case Clutter.EventType.TOUCH_END:
      case Clutter.EventType.TOUCH_CANCEL:
        this.released(...pointerPosition(event));
        return Clutter.EVENT_STOP;
      default:
        return Clutter.EVENT_PROPAGATE;
    }
  }

  private dragged(x: number, y: number): void {
    const [startX, startY] = this.pressed;
    if (!this.held) {
      if (!this.options.onPicked || Math.hypot(x - startX, y - startY) < DRAG_THRESHOLD) return;
      this.held = [startX - this.actor.x, startY - this.actor.y];
      this.endRide();
      this.stage.place(this.actor, 'above-windows');
      this.scope.run(() => this.options.onPicked!());
    }
    const [offsetX, offsetY] = this.held;
    this.actor.set_position(x - offsetX, y - offsetY);
    this.scope.run(() => this.options.onCarried?.(this.pointOf(x, y)));
  }

  private released(x: number, y: number): void {
    this.letGo();
    if (!this.held) {
      this.scope.run(() => this.options.onClick?.());
      return;
    }
    const point = this.pointOf(x, y);
    this.held = null;
    this.stage.place(this.actor, 'below-windows');
    this.scope.run(() => this.options.onDropped?.(point));
  }

  private letGo(): void {
    if (this.captured) global.stage.disconnect(this.captured);
    this.captured = 0;
    this.grab?.dismiss();
    this.grab = null;
  }

  destroy(): void {
    this.letGo();
    this.endRide();
    this.actor.destroy();
  }
}

/** An extension's sprites, shown while the wallpaper is, and the frames they share. */
export class DesktopSprites {
  private readonly sprites = new Set<DesktopSprite>();
  private readonly frames = new Map<SpriteSheet, Mirrored[]>();
  private readonly unwatch: () => void;

  constructor(private readonly stage: LayerStage, private readonly scope: Scope, private readonly name: string, private readonly pathOf: (file: string) => string) {
    this.unwatch = stage.host.desktop.watch(() => this.sync());
  }

  private sync(): void {
    for (const sprite of this.sprites) sprite.show(this.stage.host.desktop.wallpaperShown);
  }

  loadSheet(options: SpriteSheetOptions): SpriteSheet {
    const { sheet, frames } = cutFrames({ ...options, path: this.pathOf(options.path) });
    this.frames.set(sheet, frames);
    return sheet;
  }

  add(options: SpriteOptions): Sprite {
    const sprite = new DesktopSprite(options, this.frames.get(options.sheet)!, this.name, this.stage, this.scope);
    this.sprites.add(sprite);
    this.sync();
    const handle = this.scope.disposable(() => {
      this.sprites.delete(sprite);
      sprite.destroy();
    });
    return {
      place: place => sprite.place(place),
      describe: label => (sprite.actor.accessible_name = label),
      sizeOn: display => sprite.sizeOn(display),
      dispose: () => handle.dispose(),
    };
  }

  destroy(): void {
    this.unwatch();
    for (const sprite of this.sprites) sprite.destroy();
    this.sprites.clear();
    this.frames.clear();
  }
}
