import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';

import { PeekError } from '../errors.js';
import { partOf, windowOfActor } from './family.js';
import type { Combo } from './keys.js';
import type { Point } from './targets.js';

const DELIVERY_TIMEOUT = 1000;
const DRAG_STEPS = 12;
const DRAG_INTERVAL = 16;
const HELD = Clutter.ModifierType.CONTROL_MASK | Clutter.ModifierType.SHIFT_MASK | Clutter.ModifierType.MOD1_MASK
  | Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK | Clutter.ModifierType.BUTTON1_MASK
  | Clutter.ModifierType.BUTTON2_MASK | Clutter.ModifierType.BUTTON3_MASK;
const POINTER = new Set([Clutter.EventType.MOTION, Clutter.EventType.BUTTON_PRESS, Clutter.EventType.BUTTON_RELEASE, Clutter.EventType.SCROLL]);
const KEYS = new Set([Clutter.EventType.KEY_PRESS, Clutter.EventType.KEY_RELEASE]);

const shell = () => global as unknown as Shell.Global;
const prependFilter = (Clutter.Event as unknown as { prepend_filter: typeof Clutter.Event.add_filter }).prepend_filter;

interface Devices {
  readonly pointer: Clutter.VirtualInputDevice;
  readonly keyboard: Clutter.VirtualInputDevice;
}

interface Batch {
  readonly target: Meta.Window;
  last: number;
  dropped: boolean;
  delivered: () => void;
}

type Stamp = () => number;

function pause(milliseconds: number): Promise<void> {
  return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    resolve();
    return GLib.SOURCE_REMOVE;
  }));
}

export class Injector {
  private readonly batches = new Map<number, Batch>();
  private devices: Devices | null = null;
  private last = 0;
  private readonly filter: number;
  private readonly keybindings: number;

  constructor(private readonly guarded: () => boolean, ownsTheSeat: boolean) {
    if (ownsTheSeat) this.created();
    this.filter = prependFilter(null, (event, actor) => this.deliver(event, actor));
    this.keybindings = shell().window_manager.connect('filter-keybinding', () => {
      const event = Clutter.get_current_event() as Clutter.Event | null;
      return !!event && this.batches.has(event.get_time_us());
    });
  }

  destroy(): void {
    Clutter.Event.remove_filter(this.filter);
    shell().window_manager.disconnect(this.keybindings);
  }

  move(target: Meta.Window, [x, y]: Point): Promise<void> {
    return this.inject(target, stamp => this.pointer.notify_absolute_motion(stamp(), x, y));
  }

  click(target: Meta.Window, [x, y]: Point, button: number, count: number): Promise<void> {
    return this.inject(target, stamp => {
      this.pointer.notify_absolute_motion(stamp(), x, y);
      for (let index = 0; index < count; index++) {
        this.pointer.notify_button(stamp(), button, Clutter.ButtonState.PRESSED);
        this.pointer.notify_button(stamp(), button, Clutter.ButtonState.RELEASED);
      }
    });
  }

  drag(target: Meta.Window, [fromX, fromY]: Point, [toX, toY]: Point, button: number): Promise<void> {
    return this.inject(target, async stamp => {
      this.pointer.notify_absolute_motion(stamp(), fromX, fromY);
      this.pointer.notify_button(stamp(), button, Clutter.ButtonState.PRESSED);
      for (let step = 1; step <= DRAG_STEPS; step++) {
        await pause(DRAG_INTERVAL);
        this.pointer.notify_absolute_motion(stamp(), fromX + (toX - fromX) * step / DRAG_STEPS, fromY + (toY - fromY) * step / DRAG_STEPS);
      }
      await pause(DRAG_INTERVAL);
      this.pointer.notify_button(stamp(), button, Clutter.ButtonState.RELEASED);
    });
  }

  scroll(target: Meta.Window, [x, y]: Point, dx: number, dy: number): Promise<void> {
    const steps = [
      ...Array<Clutter.ScrollDirection>(Math.abs(dy)).fill(dy > 0 ? Clutter.ScrollDirection.DOWN : Clutter.ScrollDirection.UP),
      ...Array<Clutter.ScrollDirection>(Math.abs(dx)).fill(dx > 0 ? Clutter.ScrollDirection.RIGHT : Clutter.ScrollDirection.LEFT),
    ];
    return this.inject(target, stamp => {
      this.pointer.notify_absolute_motion(stamp(), x, y);
      for (const direction of steps) this.pointer.notify_discrete_scroll(stamp(), direction, Clutter.ScrollSource.WHEEL);
    });
  }

  press(target: Meta.Window, { modifiers, key }: Combo): Promise<void> {
    return this.inject(target, stamp => {
      for (const modifier of modifiers) this.keyboard.notify_keyval(stamp(), modifier, Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.RELEASED);
      for (const modifier of [...modifiers].reverse()) this.keyboard.notify_keyval(stamp(), modifier, Clutter.KeyState.RELEASED);
    });
  }

  type(target: Meta.Window, keys: number[]): Promise<void> {
    return this.inject(target, stamp => {
      for (const key of keys) {
        this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.PRESSED);
        this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.RELEASED);
      }
    });
  }

  private get pointer(): Clutter.VirtualInputDevice {
    return this.created().pointer;
  }

  private get keyboard(): Clutter.VirtualInputDevice {
    return this.created().keyboard;
  }

  private created(): Devices {
    const seat = shell().stage.context.get_backend().get_default_seat();
    this.devices ??= {
      pointer: seat.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE),
      keyboard: seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE),
    };
    return this.devices;
  }

  private deliver(event: Clutter.Event, actor: Clutter.Actor | null): boolean {
    if (!this.batches.size) return Clutter.EVENT_PROPAGATE;
    const time = event.get_time_us();
    const batch = this.batches.get(time);
    if (!batch) return Clutter.EVENT_PROPAGATE;
    const allowed = !this.guarded() && this.reaches(event.type(), actor, batch.target);
    batch.dropped ||= !allowed;
    if (time === batch.last) batch.delivered();
    return allowed ? Clutter.EVENT_PROPAGATE : Clutter.EVENT_STOP;
  }

  private reaches(type: Clutter.EventType, actor: Clutter.Actor | null, target: Meta.Window): boolean {
    if (POINTER.has(type)) {
      const window = windowOfActor(actor);
      return !!window && partOf(window, target);
    }
    if (KEYS.has(type)) {
      const stage = shell().stage;
      const focus = shell().display.focus_window;
      const keyFocus = stage.get_key_focus();
      return !!focus && partOf(focus, target) && (keyFocus === null || keyFocus === stage);
    }
    return true;
  }

  private async inject(target: Meta.Window, send: (stamp: Stamp) => void | Promise<void>): Promise<void> {
    const [, , modifiers] = shell().get_pointer();
    if (modifiers & HELD) throw new PeekError('Busy', 'Someone is holding down keys or mouse buttons. Try again in a moment.');
    const stamps: number[] = [];
    let delivered = () => {};
    const arrived = new Promise<void>(resolve => (delivered = resolve));
    const batch: Batch = { target, last: 0, dropped: false, delivered: () => delivered() };
    const stamp = () => {
      this.last = Math.max(GLib.get_monotonic_time(), this.last + 1);
      this.batches.set(this.last, batch);
      stamps.push(this.last);
      return this.last;
    };
    try {
      await send(stamp);
      batch.last = this.last;
      await Promise.race([arrived, pause(DELIVERY_TIMEOUT)]);
    } finally {
      for (const sent of stamps) this.batches.delete(sent);
    }
    if (batch.dropped) throw new PeekError('Busy', 'The input was stopped because something else was under the point or had the keyboard when it arrived');
  }
}
