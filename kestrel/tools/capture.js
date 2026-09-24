import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {showSurfaceForCapture} from 'resource:///org/gnome/shell/ui/kestrelUi.js';

import {checkSession} from './sessionChecks.js';
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
  if (actor.name === name || actor.accessible_name === name) return actor;
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

  const start = actorNamed(global.stage, 'kestrel-start');
  const entry = start.get_first_child();
  const hintPositions = [];
  const hintSignal = global.stage.connect('after-paint', () => {
    if (entry.mapped) hintPositions.push(entry.get_hint_actor().x);
  });
  global.display.emit('overlay-key');
  console.log(`Kestrel Start opening position: ${start.y + start.translation_y}`);
  await pause(450);
  global.stage.disconnect(hintSignal);
  console.log(`Kestrel opening placeholder positions: ${[...new Set(hintPositions)].join(', ')}`);
  await capture(`${output}/start.png`);
  const pointer = global.stage.context.get_backend().get_default_seat()
    .create_virtual_device(Clutter.InputDeviceType.POINTER_DEVICE);
  const launcher = actorNamed(global.stage, 'Start');
  const [launcherX, launcherY] = launcher.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), launcherX + 20, launcherY + 20);
  await pause(200);
  await capture(`${output}/launcher-hover.png`);
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
  await pause(200);
  const searchFocus = global.stage.get_key_focus();
  const caretStates = [];
  const caretImages = new Set();
  for (let i = 0; i < 7; i++) {
    caretStates.push(searchFocus.cursor_visible);
    if (!caretImages.has(searchFocus.cursor_visible)) {
      caretImages.add(searchFocus.cursor_visible);
      await capture(`${GLib.getenv('XDG_CACHE_HOME')}/caret-${searchFocus.cursor_visible}.png`);
    }
    await pause(200);
  }
  console.log(`Kestrel caret visibility: ${caretStates.join(', ')}`);
  global.stage.set_key_focus(null);
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
  global.stage.set_key_focus(searchFocus);
  const keyboard = global.stage.context.get_backend().get_default_seat().create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
  for (const key of 'files') {
    keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), key.charCodeAt(0), Clutter.KeyState.RELEASED);
  }
  await pause(150);
  await capture(`${output}/search.png`);

  searchFocus.set_text('');
  await pause(150);
  const files = actorNamed(start, 'Files');
  const [appX, appY] = files.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), appX + files.width / 2, appY + files.height / 2);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
  await pause(200);
  const contextMenu = actorNamed(global.stage, 'kestrel-context-menu');
  console.log(`Kestrel app context menu: ${contextMenu.visible}`);
  await capture(`${output}/app-context-menu.png`);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
  await pause(150);
  console.log(`Kestrel context Escape: menu=${contextMenu.visible}, start=${start.visible}`);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Menu, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Menu, Clutter.KeyState.RELEASED);
  await pause(180);
  console.log(`Kestrel keyboard context menu: ${contextMenu.visible}`);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
  showSurfaceForCapture('notifications');
  await pause(350);
  showSurfaceForCapture('quick');
  const quickSurface = actorNamed(global.stage, 'kestrel-quick-settings');
  const siblings = quickSurface.get_parent().get_children();
  console.log(`Kestrel opening surface above notifications: ${siblings.indexOf(quickSurface) > siblings.indexOf(actorNamed(global.stage, 'kestrel-notifications'))}`);
  await pause(150);
  await capture(`${output}/surface-switch.png`);
  await pause(300);
  await capture(`${output}/quick-settings.png`);
  const quick = actorNamed(global.stage, 'kestrel-quick-settings');
  const findToggle = actor => actor.title === 'Do Not Disturb' ? actor : actor.get_children().map(findToggle).find(Boolean);
  const quiet = findToggle(quick);
  if (quiet?.is_mapped()) {
    const initial = quiet.checked;
    const [x, y] = quiet.get_transformed_position();
    const clickQuiet = () => {
      pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + quiet.width / 2, y + quiet.height / 2);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
      pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    };
    clickQuiet();
    await pause(150);
    console.log(`Kestrel DND pointer toggle: ${initial} -> ${quiet.checked}`);
    clickQuiet();
    await pause(150);
    console.log(`Kestrel DND restored: ${quiet.checked === initial}`);
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
  }
  const nextPage = actorNamed(quick, 'Next page');
  if (nextPage?.is_mapped() && nextPage.reactive) {
    nextPage.emit('clicked', Clutter.BUTTON_PRIMARY);
    await pause(150);
    await capture(`${GLib.getenv('XDG_CACHE_HOME')}/quick-next-page.png`);
    console.log(`Kestrel next page: previous enabled=${actorNamed(quick, 'Previous page').reactive}`);
    actorNamed(quick, 'Previous page').emit('clicked', Clutter.BUTTON_PRIMARY);
  }
  const controls = [];
  const collectControls = actor => {
    if (actor.menu && actor.menuEnabled && actor.visible) controls.push(actor);
    actor.get_children().forEach(collectControls);
  };
  collectControls(quick);
  if (controls.length) {
    const [x, y] = controls[0].get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), x + 30, y + 25);
    await pause(200);
    await capture(`${GLib.getenv('XDG_CACHE_HOME')}/quick-hover.png`);
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
  }
  for (let index = 0; index < controls.length; index++) {
    const control = controls[index];
    control.menu.open();
    await pause(400);
    await capture(`${output}/quick-selector-${index + 1}.png`);
    console.log(`Kestrel selector: ${control.title ?? control.slider?.accessible_name}, open=${control.menu.isOpen}, height=${quick.height}`);
    control.menu.close({animate: false});
    await pause(100);
  }

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
    const panelFiles = actorNamed(actorNamed(global.stage, 'kestrel-panel'), 'Files');
    const [panelX, panelY] = panelFiles.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), panelX + 20, panelY + 20);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
    await pause(180);
    await capture(`${output}/panel-context-menu.png`);
    const favorites = new Gio.Settings({schema_id: 'org.gnome.shell'});
    const savedFavorites = favorites.get_strv('favorite-apps');
    const unpin = actorNamed(contextMenu, 'Unpin from panel');
    const [unpinX, unpinY] = unpin.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), unpinX + unpin.width / 2, unpinY + unpin.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(220);
    console.log(`Kestrel context unpin: ${!favorites.get_strv('favorite-apps').includes('org.gnome.Nautilus.desktop')}`);
    favorites.set_strv('favorite-apps', savedFavorites);
    await pause(250);
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), 20, 20);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
    await pause(180);
    console.log(`Kestrel desktop context menu: ${contextMenu.visible && !!actorNamed(contextMenu, 'Change wallpaper')}`);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
    keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
    const widths = [];
    const center = actorNamed(global.stage, 'kestrel-panel-center');
    const sample = global.stage.connect('after-paint', () => widths.push(center.width));
    const app = Gio.Subprocess.new(['gjs', '-m', windowScript], Gio.SubprocessFlags.NONE);
    try {
      await pause(1100);
      await capture(`${output}/window.png`);
      reportLayout();
      const reportDots = actor => {
        if (actor.get_style_class_name?.() === 'kestrel-running-dot' && actor.visible) {
          const icon = actor.get_parent().get_first_child();
          console.log(`Kestrel running dot gap: ${actor.get_transformed_position()[1] - icon.get_transformed_position()[1] - icon.height}`);
        }
        actor.get_children().forEach(reportDots);
      };
      reportDots(global.stage);
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
      await pause(400);
      reportLayout();
      global.stage.disconnect(sample);
      console.log(`Kestrel taskbar animated widths: ${[...new Set(widths)].join(', ')}`);
    }
  }
  await checkSession({pause, capture, actorNamed, pointer, keyboard, output});
}
