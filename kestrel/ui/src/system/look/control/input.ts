import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import type Shell from 'gi://Shell';

import { LookError } from '../errors.js';
import type { Combo } from './keys.js';
import type { Point } from './targets.js';

const FORGET_AFTER = 2000;
const DRAG_STEPS = 12;
const DRAG_INTERVAL = 16;
const HELD = Clutter.ModifierType.CONTROL_MASK | Clutter.ModifierType.SHIFT_MASK | Clutter.ModifierType.MOD1_MASK
  | Clutter.ModifierType.SUPER_MASK | Clutter.ModifierType.MOD4_MASK | Clutter.ModifierType.BUTTON1_MASK
  | Clutter.ModifierType.BUTTON2_MASK | Clutter.ModifierType.BUTTON3_MASK;
const ACTIONS = new Set([
  Clutter.EventType.BUTTON_PRESS, Clutter.EventType.BUTTON_RELEASE, Clutter.EventType.SCROLL,
  Clutter.EventType.KEY_PRESS, Clutter.EventType.KEY_RELEASE,
  Clutter.EventType.TOUCH_BEGIN, Clutter.EventType.TOUCH_UPDATE, Clutter.EventType.TOUCH_END,
]);

const shell = () => global as unknown as Shell.Global;

interface Devices {
  readonly pointer: Clutter.VirtualInputDevice;
  readonly keyboard: Clutter.VirtualInputDevice;
}

type Stamp = () => number;

function pause(milliseconds: number): Promise<void> {
  return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    resolve();
    return GLib.SOURCE_REMOVE;
  }));
}

export class Injector {
  private readonly sent = new Set<number>();
  private devices: Devices | null = null;
  private last = 0;
  private readonly filter: number;
  private readonly keybindings: number;

  constructor() {
    this.filter = Clutter.Event.add_filter(null,
      event => this.ours(event) && ACTIONS.has(event.type()) ? Clutter.EVENT_STOP : Clutter.EVENT_PROPAGATE);
    this.keybindings = shell().window_manager.connect('filter-keybinding', () => this.ours(Clutter.get_current_event()));
  }

  destroy(): void {
    Clutter.Event.remove_filter(this.filter);
    shell().window_manager.disconnect(this.keybindings);
  }

  move([x, y]: Point): Promise<void> {
    return this.inject(stamp => this.pointer.notify_absolute_motion(stamp(), x, y));
  }

  click([x, y]: Point, button: number, count: number): Promise<void> {
    return this.inject(stamp => {
      this.pointer.notify_absolute_motion(stamp(), x, y);
      for (let index = 0; index < count; index++) {
        this.pointer.notify_button(stamp(), button, Clutter.ButtonState.PRESSED);
        this.pointer.notify_button(stamp(), button, Clutter.ButtonState.RELEASED);
      }
    });
  }

  drag([fromX, fromY]: Point, [toX, toY]: Point, button: number): Promise<void> {
    return this.inject(async stamp => {
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

  scroll([x, y]: Point, dx: number, dy: number): Promise<void> {
    const steps = [
      ...Array<Clutter.ScrollDirection>(Math.abs(dy)).fill(dy > 0 ? Clutter.ScrollDirection.DOWN : Clutter.ScrollDirection.UP),
      ...Array<Clutter.ScrollDirection>(Math.abs(dx)).fill(dx > 0 ? Clutter.ScrollDirection.RIGHT : Clutter.ScrollDirection.LEFT),
    ];
    return this.inject(stamp => {
      this.pointer.notify_absolute_motion(stamp(), x, y);
      for (const direction of steps) this.pointer.notify_discrete_scroll(stamp(), direction, Clutter.ScrollSource.WHEEL);
    });
  }

  press({ modifiers, key }: Combo): Promise<void> {
    return this.inject(stamp => {
      for (const modifier of modifiers) this.keyboard.notify_keyval(stamp(), modifier, Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(stamp(), key, Clutter.KeyState.RELEASED);
      for (const modifier of [...modifiers].reverse()) this.keyboard.notify_keyval(stamp(), modifier, Clutter.KeyState.RELEASED);
    });
  }

  type(keys: number[]): Promise<void> {
    return this.inject(stamp => {
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

  private ours(event: Clutter.Event | null): boolean {
    return this.sent.size > 0 && !!event && this.sent.has(event.get_time_us());
  }

  private async inject(send: (stamp: Stamp) => void | Promise<void>): Promise<void> {
    const [, , modifiers] = shell().get_pointer();
    if (modifiers & HELD) throw new LookError('Busy', 'Someone is holding down keys or mouse buttons. Try again in a moment.');
    const stamps: number[] = [];
    const stamp = () => {
      this.last = Math.max(GLib.get_monotonic_time(), this.last + 1);
      this.sent.add(this.last);
      stamps.push(this.last);
      return this.last;
    };
    try {
      await send(stamp);
    } finally {
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, FORGET_AFTER, () => {
        for (const sent of stamps) this.sent.delete(sent);
        return GLib.SOURCE_REMOVE;
      });
    }
  }
}
