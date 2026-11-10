import Clutter from 'gi://Clutter';

import type { Scope } from '../../../../runtime/scope.js';
import type { Disposable, Sprite, SpriteOptions, SpritePlace, SpritePoint, SpriteSheet, SpriteSheetOptions } from '../../types.js';
import { cutFrames, type Mirrored, SpriteActor } from './frames.js';
import { FrameStepper } from './frameStepper.js';
import { WindowRide } from './ride.js';
import { SmoothSprite } from './smoothSprite.js';
import type { LayerStage } from './stage.js';
import { windowWithId } from './surfaces.js';

const DRAG_THRESHOLD = 6;

const pointerPosition = (event: Clutter.Event): [number, number] => {
  const [x, y] = event.get_coords();
  return [x, y];
};

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

export class DesktopSprites {
  private readonly sprites = new Set<DesktopSprite | SmoothSprite>();
  private readonly frames = new Map<SpriteSheet, Mirrored[]>();
  private readonly unwatch: () => void;
  private readonly stepper: FrameStepper;
  private readonly groups = new Map<number, Clutter.Actor>();
  private readonly unwatchMonitors: () => void;

  constructor(private readonly stage: LayerStage, private readonly scope: Scope, private readonly name: string, private readonly pathOf: (file: string) => string) {
    this.unwatch = stage.host.desktop.watch(() => this.sync());
    this.stepper = new FrameStepper(scope);
    this.unwatchMonitors = stage.host.watchMonitors(() => this.fitGroups());
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
    const frames = this.frames.get(options.sheet)!;
    const sprite = options.smooth
      ? new SmoothSprite(options, frames, this.name, this.stage, this.scope, this.groupOn(options.display ?? this.stage.primaryIndex()))
      : new DesktopSprite(options, frames, this.name, this.stage, this.scope);
    this.sprites.add(sprite);
    this.sync();
    if (sprite.actor.reactive) this.stage.host.bindDesktopMenu(sprite.actor);
    const handle = this.scope.disposable(() => {
      this.sprites.delete(sprite);
      sprite.destroy();
    });
    const made: Sprite = {
      place: place => sprite.place(place),
      describe: label => (sprite.actor.accessible_name = label),
      sizeOn: display => sprite.sizeOn(display),
      dispose: () => handle.dispose(),
    };
    if (sprite instanceof SmoothSprite) sprite.handle = made;
    return made;
  }

  private groupOn(display: number): Clutter.Actor {
    let group = this.groups.get(display);
    if (!group) {
      group = new Clutter.Actor({ name: `${this.name}-group`, clip_to_allocation: true });
      this.groups.set(display, group);
      this.stage.place(group, 'below-windows');
      this.fitGroups();
    }
    return group;
  }

  private fitGroups(): void {
    for (const { index, x, y, width, height } of this.stage.monitors()) {
      const group = this.groups.get(index);
      group?.set_position(x, y);
      group?.set_size(width, height);
    }
  }

  lift(lifted: boolean): void {
    for (const group of this.groups.values()) this.stage.place(group, lifted ? 'above-windows' : 'below-windows');
  }

  onFrame(step: (seconds: number) => boolean): Disposable {
    return this.stepper.add(step);
  }

  destroy(): void {
    this.unwatch();
    this.unwatchMonitors();
    this.stepper.destroy();
    for (const sprite of this.sprites) sprite.destroy();
    this.sprites.clear();
    this.frames.clear();
    for (const group of this.groups.values()) group.destroy();
    this.groups.clear();
  }
}
