import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {disableHelperAutoExit} from 'resource:///org/gnome/shell/ui/scripting.js';

import {checkPeople} from './checks/greeter/peopleChecks.js';
import {checkControls} from './checks/greeter/controlChecks.js';
import {checkSigningIn} from './checks/greeter/signInChecks.js';
import {reportResources} from './checks/greeter/resources.js';

export const METRICS = {};

function pause(milliseconds) {
  return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
    resolve();
    return GLib.SOURCE_REMOVE;
  }));
}

async function capture(path) {
  const stream = Gio.File.new_for_path(path).replace(null, false, Gio.FileCreateFlags.NONE, null);
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => screenshot.screenshot(false, stream, (source, result) => {
    try {
      source.screenshot_finish(result);
      resolve();
    } catch (error) {
      reject(error);
    }
  }));
  stream.close(null);
}

function descendants(actor) {
  return [actor, ...actor.get_children().flatMap(descendants)];
}

function events() {
  const [, contents] = Gio.File.new_for_path(GLib.getenv('KESTREL_GREETER_EVENTS')).load_contents(null);
  return new TextDecoder().decode(contents).trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
}

export async function run() {
  await disableHelperAutoExit();
  const seat = global.stage.context.get_backend().get_default_seat();
  const pointer = seat.create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
  const keyboard = seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  const find = (name, root = global.stage) => descendants(root).find(actor => actor.name === name || actor.accessible_name === name) ?? null;
  const tools = {
    output: GLib.getenv('KESTREL_CAPTURE_DIR'),
    images: GLib.getenv('KESTREL_GREETER_IMAGES'),
    state: GLib.getenv('KESTREL_GREETER_STATE_DIR'),
    pause,
    capture,
    events,
    find,
    visible: actor => !!actor && actor.mapped && actor.opacity > 0,
    styled: (name, root = global.stage) => descendants(root).filter(actor => actor.mapped && actor.has_style_class_name?.(name)),
    require: (condition, label) => {
      if (!condition) throw new Error(`Kestrel login screen check failed: ${label}`);
      console.log(`Kestrel login screen check: ${label}`);
    },
    press: async (symbol, delay = 60) => {
      keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.PRESSED);
      keyboard.notify_keyval(GLib.get_monotonic_time(), symbol, Clutter.KeyState.RELEASED);
      await pause(delay);
    },
    type: async text => {
      for (const character of text) {
        keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.unicode_to_keysym(character.codePointAt(0)), Clutter.KeyState.PRESSED);
        keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.unicode_to_keysym(character.codePointAt(0)), Clutter.KeyState.RELEASED);
      }
      await pause(80);
    },
    click: async (actor, delay = 400) => {
      const [x, y] = actor.get_transformed_position();
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + actor.width / 2, y + actor.height / 2);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
      await pause(delay);
    },
  };

  await reportResources(tools);
  await capture(`${tools.output}/login-clock.png`);
  await checkPeople(tools);
  await checkControls(tools);
  await checkSigningIn(tools);
}
