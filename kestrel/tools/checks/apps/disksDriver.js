import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {sleep, waitFor} from './luftApp.js';

const LOADING = 800;
const CHECKS = 'com.lantharos.KestrelChecks';

function systemCalls() {
  const bus = Gio.DBusConnection.new_for_address_sync(GLib.getenv('KESTREL_SYSTEM_BUS'),
    Gio.DBusConnectionFlags.AUTHENTICATION_CLIENT | Gio.DBusConnectionFlags.MESSAGE_BUS_CONNECTION, null, null);
  return () => bus.call_sync(CHECKS, '/com/lantharos/KestrelChecks', `${CHECKS}.Calls`, 'Take', null,
    new GLib.VariantType('(as)'), Gio.DBusCallFlags.NONE, -1, null).deep_unpack()[0];
}

export class Driver {
  constructor(app, {pointer, output}, positions) {
    this.app = app;
    this.pointer = pointer;
    this.positions = positions;
    this.keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
    this.output = output;
    this.takeCalls = systemCalls();
    this.takeCalls();
  }

  press([x, y], times = 1) {
    const frame = this.app.window.get_frame_rect();
    this.pointer.notify_absolute_motion(GLib.get_monotonic_time(), frame.x + x, frame.y + y);
    for (let press = 0; press < times; press++) {
      this.pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
      this.pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    }
  }

  async click(name) {
    this.press(this.positions[name]);
    return this.shown(name);
  }

  async fill(name, text) {
    this.press(this.positions[name], 3);
    await sleep(LOADING / 2);
    await this.type(text);
    await this.key(Clutter.KEY_Return);
    return this.shown(name);
  }

  async type(text) {
    for (const character of text) {
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), character.codePointAt(0), Clutter.KeyState.RELEASED);
    }
    await sleep(LOADING / 2);
  }

  async key(keyval) {
    this.keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.PRESSED);
    this.keyboard.notify_keyval(GLib.get_monotonic_time(), keyval, Clutter.KeyState.RELEASED);
    await sleep(LOADING / 2);
  }

  async tab(times = 1, backwards = false) {
    if (backwards)
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Shift_L, Clutter.KeyState.PRESSED);
    for (let step = 0; step < times; step++) {
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Tab, Clutter.KeyState.PRESSED);
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Tab, Clutter.KeyState.RELEASED);
    }
    if (backwards)
      this.keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Shift_L, Clutter.KeyState.RELEASED);
    await sleep(LOADING / 2);
  }

  async enter(name, text) {
    await this.type(text);
    await this.key(Clutter.KEY_Return);
    return this.shown(name);
  }

  async shown(name) {
    await sleep(LOADING);
    const frame = await this.app.settle(() => true);
    frame.save(`${this.output}/disks-step-${name}.png`);
    return frame;
  }

  async called(expected, describe, timeout = 5000) {
    let seen = [];
    await waitFor(() => {
      seen = [...seen, ...this.takeCalls()];
      return expected.every(call => seen.includes(call));
    }, timeout, () => `${describe}: expected ${expected.join(', ')}, saw ${seen.join(', ') || 'nothing'}`);
    return seen;
  }
}
