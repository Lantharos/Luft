import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import {disableHelperAutoExit} from 'resource:///org/gnome/shell/ui/scripting.js';
import {toggleSurface} from 'resource:///org/gnome/shell/ui/kestrelUi.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

import {checkFolders} from './checks/desktop/folderChecks.js';
import {checkSession} from './checks/desktop/sessionChecks.js';
import {checkClipboardPlacement} from './checks/input/clipboardChecks.js';
import {checkClipboardImages} from './checks/input/clipboardImageChecks.js';
import {checkEmoji} from './checks/input/emojiChecks.js';
import {checkTray} from './checks/desktop/trayChecks.js';
import {checkTaskView} from './checks/desktop/taskViewChecks.js';
import {checkNotifications} from './checks/desktop/notificationChecks.js';
import {checkSnapGroups} from './checks/desktop/snapGroupChecks.js';
import {checkTaskbar} from './checks/desktop/taskbarChecks.js';
import {checkLiveWallpaper} from './checks/desktop/wallpaperChecks.js';
import {checkPanelStatus} from './checks/system/panelStatusChecks.js';
import {checkInputSources} from './checks/input/inputSourceChecks.js';
import {checkMediaKeys} from './checks/input/mediaKeyChecks.js';
import {checkShortcuts} from './checks/system/shortcutChecks.js';
import {checkQuickTiles} from './checks/system/quickTileChecks.js';
import {checkSessionManager} from './checks/system/sessionManagerChecks.js';
import {checkPortal} from './checks/system/portalChecks.js';
import {checkAppearance} from './checks/system/appearanceChecks.js';
import {checkCursor} from './checks/system/cursorChecks.js';
import {checkNightLight} from './checks/system/nightLightChecks.js';
import {checkPower} from './checks/system/powerChecks.js';
import {checkAppIcons} from './checks/system/appIconChecks.js';
import {captureRenderedFrames} from './checks/frameCapture.js';

export const METRICS = {};
const FILE_MANAGER = 'com.lantharos.rover.desktop';

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
  await disableHelperAutoExit();
  const pinned = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
  if (!pinned.get_strv('favorite-apps').includes(FILE_MANAGER))
    pinned.set_strv('favorite-apps', [FILE_MANAGER, ...pinned.get_strv('favorite-apps')]);
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
  if (!caretStates.includes(false)) throw new Error('Search caret did not blink');
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

  const files = actorNamed(start, 'Rover');
  const [appX, appY] = files.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), appX + files.width / 2, appY + files.height / 2);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
  await pause(200);
  const contextMenu = actorNamed(global.stage, 'kestrel-context-menu');
  console.log(`Kestrel app context menu: ${contextMenu.visible}`);
  const menuActions = actor => [actor, ...actor.get_children().flatMap(menuActions)]
    .filter(child => child.has_style_class_name?.('kestrel-context-action'));
  const secondAction = menuActions(contextMenu)[1];
  const [actionX, actionY] = secondAction.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), actionX + 20, actionY + secondAction.height / 2);
  await pause(150);
  if (global.stage.get_key_focus() !== secondAction) throw new Error('Menu focus did not follow pointer');
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
  toggleSurface('notifications');
  await pause(350);
  toggleSurface('quick');
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

  toggleSurface('notifications');
  await pause(450);
  await capture(`${output}/notification-center.png`);

  toggleSurface('start');
  await pause(450);
  const powerButton = start.get_last_child().get_last_child();
  const [powerX, powerY] = powerButton.get_transformed_position();
  pointer.notify_absolute_motion(GLib.get_monotonic_time(), powerX + powerButton.width / 2,
    powerY + powerButton.height / 2);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
  pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
  await pause(450);
  await capture(`${output}/power-menu.png`);
  const sessionActions = actorNamed(start, 'Power off').get_parent();
  console.log(`Kestrel power options: start=${start.visible}, actions=${sessionActions.visible}`);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_Escape, Clutter.KeyState.RELEASED);
  await pause(350);
  console.log(`Kestrel power options Escape: start=${start.visible}, actions=${sessionActions.visible}`);

  const windowScript = GLib.getenv('KESTREL_WINDOW_SCRIPT');
  if (windowScript) {
    toggleSurface('start');
    await pause(350);
    console.log(`Kestrel Start closed: visible=${start.visible}, position=${start.y + start.translation_y}`);
    const panelFiles = actorNamed(actorNamed(global.stage, 'kestrel-panel'), 'Rover');
    const [panelX, panelY] = panelFiles.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), panelX + 20, panelY + 20);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_SECONDARY, Clutter.ButtonState.RELEASED);
    await pause(180);
    await capture(`${output}/panel-context-menu.png`);
    const favorites = new Gio.Settings({schema_id: 'com.lantharos.kestrel'});
    const savedFavorites = favorites.get_strv('favorite-apps');
    const unpin = actorNamed(contextMenu, 'Unpin from panel');
    const [unpinX, unpinY] = unpin.get_transformed_position();
    pointer.notify_absolute_motion(GLib.get_monotonic_time(), unpinX + unpin.width / 2, unpinY + unpin.height / 2);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.PRESSED);
    pointer.notify_button(GLib.get_monotonic_time(), Clutter.BUTTON_PRIMARY, Clutter.ButtonState.RELEASED);
    await pause(220);
    console.log(`Kestrel context unpin: ${!favorites.get_strv('favorite-apps').includes(FILE_MANAGER)}`);
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
      toggleSurface('start');
      await pause(450);
      await capture(`${output}/start-over-window.png`);
      toggleSurface('start');
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
  await checkClipboardPlacement({pause, capture, actorNamed, keyboard, output});
  await checkClipboardImages({pause, capture, actorNamed, keyboard, output});
  await checkEmoji({pause, capture, actorNamed, keyboard, output});
  await checkFolders({pause, capture, actorNamed, pointer, output});
  await checkTray({pause, capture, actorNamed, pointer, output});
  await checkTaskView({pause, capture, actorNamed, pointer, keyboard, output});
  await checkNotifications({pause, capture, actorNamed, output});
  await checkSnapGroups({pause});
  await checkTaskbar({pause, capture, actorNamed, pointer, output});
  await checkPanelStatus({pause, capture, actorNamed, pointer, output});
  await checkInputSources({pause, capture, actorNamed, pointer, keyboard, output});
  await checkShortcuts({pause, capture, pointer, keyboard, output});
  await checkMediaKeys({pause, keyboard});
  await checkQuickTiles({pause, capture, actorNamed, pointer, output});
  await checkSessionManager({pause, pointer});
  await checkPortal({pause});
  await checkAppearance({pause, capture, output});
  await checkCursor({pause, pointer});
  await checkNightLight({pause});
  await checkPower({pause, pointer});
  await checkAppIcons({pause, capture, actorNamed, output});
  await checkLiveWallpaper({pause, actorNamed});

  const source = new MessageTray.Source({title: 'Messages', iconName: 'mail-unread-symbolic'});
  Main.messageTray.add(source);
  const notification = new MessageTray.Notification({source, title: 'Ayesha', body: 'Are we still on for tomorrow? I booked the table for seven.'});
  notification.addAction('Reply', () => {});
  source.addNotification(notification);
  await pause(600);
  await capture(`${output}/notification-banner.png`);
  source.destroy();
  await pause(400);

  Main.screenShield.lock(true);
  await pause(1200);
  const lockedSource = new MessageTray.Source({title: 'Messages', iconName: 'mail-unread-symbolic'});
  Main.messageTray.add(lockedSource);
  lockedSource.addNotification(new MessageTray.Notification({source: lockedSource, title: 'Ayesha', body: 'Running ten minutes late.'}));
  await pause(600);
  const previews = [];
  const collectPreviews = actor => {
    if (actor.get_style_class_name?.() === 'unlock-dialog-notification-preview-title') previews.push(actor.text);
    actor.get_children().forEach(collectPreviews);
  };
  collectPreviews(global.stage);
  console.log(`Kestrel lock screen previews: ${previews.join(', ')}`);
  pointer.notify_relative_motion(GLib.get_monotonic_time(), 30, 30);
  await pause(1200);
  await capture(`${output}/lock-screen.png`);
  lockedSource.destroy();
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_space, Clutter.KeyState.PRESSED);
  keyboard.notify_keyval(GLib.get_monotonic_time(), Clutter.KEY_space, Clutter.KeyState.RELEASED);
  await pause(1200);
  await capture(`${output}/unlock-prompt.png`);
  Main.screenShield.deactivate(false);
  await pause(600);
}
