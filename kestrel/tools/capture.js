import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {showSurfaceForCapture} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

import {captureRenderedFrames} from './frameCapture.js';

export const METRICS = {};

function pause(milliseconds) {
  return new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
      resolve();
      return GLib.SOURCE_REMOVE;
    });
  });
}

async function capture(path) {
  const stream = Gio.File.new_for_path(path).replace(
    null,
    false,
    Gio.FileCreateFlags.NONE,
    null,
  );
  const screenshot = new Shell.Screenshot();
  await new Promise((resolve, reject) => {
    screenshot.screenshot(false, stream, (source, result) => {
      try {
        source.screenshot_finish(result);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  stream.close(null);
}

function actorNamed(actor, name) {
  if (actor.name === name) return actor;
  for (const child of actor.get_children()) {
    const found = actorNamed(child, name);
    if (found) return found;
  }
  return null;
}

function reportLayout() {
  const geometry = {};
  for (const name of ['kestrel-panel', 'kestrel-panel-center', 'kestrel-panel-status']) {
    const actor = actorNamed(global.stage, name);
    geometry[name] = { position: actor.get_transformed_position(), size: actor.get_size() };
  }
  console.log(`Kestrel geometry: ${JSON.stringify(geometry)}`);
}

export async function run() {
  const output = GLib.getenv('KESTREL_CAPTURE_DIR');
  if (!output)
    throw new Error('KESTREL_CAPTURE_DIR is required');

  await pause(700);
  await capture(`${output}/panel.png`);
  reportLayout();

  global.display.emit('overlay-key');
  const start = actorNamed(global.stage, 'kestrel-start');
  console.log(`Kestrel Start opening position: ${start.y + start.translation_y}`);
  await pause(450);
  await capture(`${output}/start.png`);
  const pointer = global.stage.context.get_backend().get_default_seat()
    .create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
  await captureRenderedFrames(`${output}/start-hover.png`, async () => {
    for (const [x, y] of [[70, 160], [172, 250], [274, 340], [376, 160], [478, 250]]) {
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), start.x + x, start.y + y);
      await pause(220);
    }
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
    await pause(300);
  });
  await captureRenderedFrames(`${GLib.getenv('XDG_CACHE_HOME')}/start-repainted.png`, async () => {
    global.stage.queue_redraw();
    await pause(100);
  });
  let idleFrames = 0;
  const idleSignal = global.stage.connect('after-paint', () => idleFrames++);
  await pause(1000);
  global.stage.disconnect(idleSignal);
  console.log(`Kestrel settled hover frames in one second: ${idleFrames}`);
  const keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  for (const key of 'files') {
    keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.RELEASED);
  }
  await pause(150);
  await capture(`${output}/search.png`);

  showSurfaceForCapture('quick');
  await pause(450);
  await capture(`${output}/quick-settings.png`);

  showSurfaceForCapture('notifications');
  await pause(450);
  await capture(`${output}/notification-center.png`);

  showSurfaceForCapture('start');
  await pause(450);
  const powerButton = start.get_last_child().get_last_child();
  const [powerX, powerY] = powerButton.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), powerX + powerButton.width / 2,
    powerY + powerButton.height / 2);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await pause(450);
  await capture(`${output}/power-menu.png`);
  console.log(`Kestrel power submenu: start=${start.visible}, power=${actorNamed(global.stage, 'kestrel-power').visible}`);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
  await pause(350);
  console.log(`Kestrel submenu Escape: start=${start.visible}, power=${actorNamed(global.stage, 'kestrel-power').visible}`);

  const windowScript = GLib.getenv('KESTREL_WINDOW_SCRIPT');
  if (windowScript) {
    showSurfaceForCapture('start');
    await pause(350);
    console.log(`Kestrel Start closed: visible=${start.visible}, position=${start.y + start.translation_y}`);
    const app = Gio.Subprocess.new(['gjs', '-m', windowScript], Gio.SubprocessFlags.NONE);
    try {
      await pause(1100);
      await capture(`${output}/window.png`);
      reportLayout();
      showSurfaceForCapture('start');
      await pause(450);
      await capture(`${output}/start-over-window.png`);
      showSurfaceForCapture('start');
      const window = global.get_window_actors().find(actor => actor.meta_window.get_title() === 'Kestrel window check');
      window.meta_window.maximize();
      await pause(400);
      await capture(`${output}/window-maximized.png`);
      const {x, y, width, height} = window.meta_window.get_frame_rect();
      console.log(`Kestrel window work area: ${JSON.stringify({x, y, width, height})}`);
    } finally {
      app.force_exit();
    }
  }
}
