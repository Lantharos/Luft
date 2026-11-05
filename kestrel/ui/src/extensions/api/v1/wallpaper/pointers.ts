import Clutter from 'gi://Clutter';

import type { Scope } from '../../../runtime/scope.js';
import type { ExtensionHost } from '../../../host.js';
import type { DesktopPointerEvent, PointerArea, PointerFollowOptions, Sprite } from '../types.js';

const MOUSE = 0;
const DESKTOP_SIGNALS = ['motion-event', 'button-press-event', 'button-release-event', 'touch-event', 'leave-event'] as const;

interface StageArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

type Phase = DesktopPointerEvent['phase'];

/** An extension's interest in the pointer: its areas, and which pointers it has heard of and not yet heard the last of. */
export class PointerFollower {
  private areas: StageArea[] = [];
  readonly near = new Set<number>();
  readonly held = new Map<number, Sprite>();

  constructor(private readonly pointers: DesktopPointers, private readonly host: ExtensionHost, readonly scope: Scope, readonly options: PointerFollowOptions) {
    this.setAreas(options.areas);
  }

  setAreas(areas: readonly PointerArea[]): void {
    const monitors = this.host.monitors();
    this.areas = areas.flatMap(({ display, x, y, width, height }) => {
      const monitor = monitors.find(({ index }) => index === display);
      if (!monitor) return [];
      return [{ left: monitor.x + x, top: monitor.y + y, right: monitor.x + x + width, bottom: monitor.y + y + height }];
    });
  }

  covers(x: number, y: number): boolean {
    return this.areas.some(({ left, top, right, bottom }) => x >= left && x < right && y >= top && y < bottom);
  }

  stop(): void {
    this.pointers.remove(this);
  }
}

const fingerOf = (event: Clutter.Event) => event.get_event_sequence().get_slot() + 1;

const pressedButtons = Clutter.ModifierType.BUTTON1_MASK | Clutter.ModifierType.BUTTON2_MASK | Clutter.ModifierType.BUTTON3_MASK;

/**
 * Where the pointer and fingers are on the bare desktop, for extensions that asked. Clutter only sends these events
 * while the desktop is what's under the pointer, so a window in front stops them by itself, and nothing here is
 * connected while nobody follows. Anything else costs one look through the areas for each motion.
 */
export class DesktopPointers {
  private readonly followers = new Set<PointerFollower>();
  private stops: (() => void)[] = [];

  constructor(private readonly host: ExtensionHost) {}

  follow(options: PointerFollowOptions, scope: Scope): PointerFollower {
    const follower = new PointerFollower(this, this.host, scope, options);
    if (!this.followers.size) this.start();
    this.followers.add(follower);
    return follower;
  }

  remove(follower: PointerFollower): void {
    this.followers.delete(follower);
    if (!this.followers.size) this.stop();
  }

  /** Events only reach reactive actors, so it's each display's wallpaper that hears them, not the group around them. */
  private feelOn(actor: Clutter.Actor): void {
    const feel = (_actor: Clutter.Actor, event: Clutter.Event) => this.fromDesktop(event);
    const signals = DESKTOP_SIGNALS.map(signal => actor.connect(signal as 'motion-event', feel));
    this.stops.push(() => signals.forEach(signal => actor.disconnect(signal)));
  }

  private start(): void {
    const { wallpaper, desktop } = this.host;
    wallpaper.get_children().forEach(actor => this.feelOn(actor));
    const added = wallpaper.connect('child-added', (_wallpaper, actor: Clutter.Actor) => this.feelOn(actor));
    const unwatch = desktop.watch(() => {
      if (!desktop.wallpaperShown) this.allGone();
    });
    this.stops.push(() => wallpaper.disconnect(added), unwatch);
  }

  private stop(): void {
    for (const stop of this.stops.splice(0)) stop();
  }

  private allGone(): void {
    for (const follower of this.followers) {
      for (const id of [...follower.near]) this.send(follower, id, 'gone', 0, 0, 0, null);
      follower.held.clear();
    }
  }

  private fromDesktop(event: Clutter.Event): boolean {
    this.feel(event, null, null);
    return Clutter.EVENT_PROPAGATE;
  }

  /** What happens on a sprite that takes presses: a press there stays with it until it's let go, wherever it goes. */
  fromSprite(sprite: Sprite, scope: Scope, event: Clutter.Event): boolean {
    return this.feel(event, sprite, scope) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE;
  }

  /** Stops following presses on a sprite that's going away. */
  forget(sprite: Sprite): void {
    for (const follower of this.followers) {
      for (const [id, held] of follower.held) {
        if (held === sprite) follower.held.delete(id);
      }
    }
  }

  private feel(event: Clutter.Event, sprite: Sprite | null, scope: Scope | null): boolean {
    const type = event.type();
    if (type === Clutter.EventType.LEAVE) {
      this.left(event);
      return false;
    }
    const touch = type === Clutter.EventType.TOUCH_BEGIN || type === Clutter.EventType.TOUCH_UPDATE ||
      type === Clutter.EventType.TOUCH_END || type === Clutter.EventType.TOUCH_CANCEL;
    const id = touch ? fingerOf(event) : MOUSE;
    const [x, y] = event.get_coords();
    const time = event.get_time_us() / 1000;
    if (type === Clutter.EventType.BUTTON_PRESS || type === Clutter.EventType.TOUCH_BEGIN) {
      const primary = touch || event.get_button() === Clutter.BUTTON_PRIMARY;
      if (!primary) return false;
      this.pressed(id, x, y, time, sprite, scope);
      return !!sprite;
    }
    if (type === Clutter.EventType.BUTTON_RELEASE || type === Clutter.EventType.TOUCH_END || type === Clutter.EventType.TOUCH_CANCEL) {
      if (!touch && event.get_button() !== Clutter.BUTTON_PRIMARY) return false;
      this.released(id, x, y, time);
      return !!sprite;
    }
    if (type === Clutter.EventType.MOTION || type === Clutter.EventType.TOUCH_UPDATE) {
      this.moved(id, x, y, time, touch || !!(event.get_state() & pressedButtons));
      return false;
    }
    return false;
  }

  private pressed(id: number, x: number, y: number, time: number, sprite: Sprite | null, scope: Scope | null): void {
    for (const follower of this.followers) {
      const takes = !!sprite && follower.scope === scope;
      if (takes) follower.held.set(id, sprite);
      if (takes || follower.covers(x, y)) this.send(follower, id, 'down', x, y, time, takes ? sprite : null);
    }
  }

  private released(id: number, x: number, y: number, time: number): void {
    for (const follower of this.followers) {
      const sprite = follower.held.get(id) ?? null;
      follower.held.delete(id);
      if (sprite || follower.near.has(id)) this.send(follower, id, 'up', x, y, time, sprite);
    }
  }

  private moved(id: number, x: number, y: number, time: number, pressing: boolean): void {
    let onDesktop: boolean | null = null;
    for (const follower of this.followers) {
      const sprite = follower.held.get(id) ?? null;
      if (sprite) {
        this.send(follower, id, 'move', x, y, time, sprite);
        continue;
      }
      if (!follower.near.has(id) && !follower.covers(x, y)) continue;
      onDesktop ??= !pressing || this.desktopAt(x, y);
      if (onDesktop && follower.covers(x, y)) this.send(follower, id, 'move', x, y, time, null);
      else if (follower.near.has(id)) this.send(follower, id, 'gone', x, y, time, null);
    }
  }

  /** A press on the desktop keeps sending events wherever it goes, even over windows, which shouldn't count. */
  private desktopAt(x: number, y: number): boolean {
    const actor = global.stage.get_actor_at_pos(Clutter.PickMode.REACTIVE, x, y);
    return this.host.wallpaper.contains(actor) || this.isSprite(actor);
  }

  private left(event: Clutter.Event): void {
    const related = event.get_related();
    if (related && (this.host.wallpaper.contains(related) || this.isSprite(related))) return;
    const id = event.get_event_sequence() ? fingerOf(event) : MOUSE;
    for (const follower of this.followers) {
      if (follower.near.has(id) && !follower.held.has(id)) this.send(follower, id, 'gone', 0, 0, 0, null);
    }
  }

  private isSprite(actor: Clutter.Actor): boolean {
    return actor.name?.startsWith('extension-sprite:') ?? false;
  }

  private send(follower: PointerFollower, id: number, phase: Phase, x: number, y: number, time: number, sprite: Sprite | null): void {
    const monitor = this.host.monitorAt(x, y) ?? this.host.monitors()[0];
    if (phase === 'gone' || (phase === 'up' && id !== MOUSE)) follower.near.delete(id);
    else follower.near.add(id);
    const event: DesktopPointerEvent = { id, kind: id === MOUSE ? 'mouse' : 'touch', phase, display: monitor.index, x: x - monitor.x, y: y - monitor.y, time, sprite };
    follower.scope.run(() => follower.options.onPointer(event));
  }
}
