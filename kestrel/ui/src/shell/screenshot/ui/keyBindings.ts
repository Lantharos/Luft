import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from '../../main.js';
import { captureScreenshot } from '../capture.js';
import type { ScreenshotUI } from './screenshotUI.js';

export const SELECTION_KEYBOARD_INCREMENT = 5;
const CTRL_SELECTION_KEYBOARD_INCREMENT = 1;

const { CONTROL_MASK, SHIFT_MASK, MOD1_MASK } = Clutter.ModifierType;
const NO_MODIFIERS = 0 as Clutter.ModifierType;

const ARROWS = [
  ['left', Clutter.KEY_Left, St.DirectionType.LEFT],
  ['right', Clutter.KEY_Right, St.DirectionType.RIGHT],
  ['up', Clutter.KEY_Up, St.DirectionType.UP],
  ['down', Clutter.KEY_Down, St.DirectionType.DOWN],
] as const;

type Action = (ui: ScreenshotUI, modifiers: Clutter.ModifierType) => void;

function increment(direction: St.DirectionType, modifiers: Clutter.ModifierType): number {
  if (modifiers & CONTROL_MASK) return CTRL_SELECTION_KEYBOARD_INCREMENT;
  if (!(modifiers & SHIFT_MASK)) return SELECTION_KEYBOARD_INCREMENT;

  const monitor = Main.layoutManager.primaryMonitor!;
  return direction === St.DirectionType.LEFT || direction === St.DirectionType.RIGHT ? monitor.width : monitor.height;
}

function install(pool: Clutter.BindingPool, name: string, key: number, modifiers: Clutter.ModifierType, action: Action): void {
  pool.install_closure(name, key, modifiers, ((ui: ScreenshotUI, _name: string, _key: number, pressed: Clutter.ModifierType) => {
    action(ui, pressed);
    return Clutter.EVENT_STOP;
  }) as unknown as GObject.Closure);
}

export function installKeyBindings(pool: Clutter.BindingPool): void {
  const activate: Action = ui => ui.activate();
  install(pool, 'activate', Clutter.KEY_Return, NO_MODIFIERS, activate);
  install(pool, 'activate', Clutter.KEY_space, NO_MODIFIERS, activate);
  install(pool, 'activate', Clutter.KEY_c, CONTROL_MASK, activate);

  install(pool, 'selection', Clutter.KEY_s, NO_MODIFIERS, ui => {
    ui.panel.selectionButton.checked = true;
  });
  install(pool, 'screen', Clutter.KEY_c, NO_MODIFIERS, ui => {
    ui.panel.screenButton.checked = true;
  });
  install(pool, 'window', Clutter.KEY_w, NO_MODIFIERS, ({ panel }) => {
    if (panel.windowButton.reactive) panel.windowButton.checked = true;
  });
  install(pool, 'screencast', Clutter.KEY_v, NO_MODIFIERS, ({ panel }) => {
    if (panel.castButton.reactive) panel.castButton.checked = !panel.castButton.checked;
  });
  install(pool, 'pointer', Clutter.KEY_p, NO_MODIFIERS, ({ panel }) => {
    panel.showPointerButton.checked = !panel.showPointerButton.checked;
  });

  for (const [name, key, direction] of ARROWS) {
    const resize: Action = (ui, modifiers) => ui.resizeSelection(direction, increment(direction, modifiers));
    const move: Action = (ui, modifiers) => ui.moveSelection(direction, increment(direction, modifiers));

    install(pool, `move-${name}`, key, NO_MODIFIERS, ui => ui.moveFocus(direction));
    install(pool, `resize-selection-${name}-control`, key, CONTROL_MASK, resize);
    install(pool, `resize-selection-${name}-shift`, key, SHIFT_MASK, resize);
    install(pool, `move-selection-${name}`, key, MOD1_MASK, move);
    install(pool, `move-selection-${name}-control`, key, MOD1_MASK | CONTROL_MASK, move);
    install(pool, `move-selection-${name}-shift`, key, MOD1_MASK | SHIFT_MASK, move);
  }

  install(pool, 'reset', Clutter.KEY_r, NO_MODIFIERS, ui => ui.resetArea());
}

async function captureWindow(window: Meta.Window): Promise<void> {
  try {
    const actor = window.get_compositor_private() as Meta.WindowActor;
    const content = actor.paint_to_content(null) as Clutter.TextureContent;
    await captureScreenshot(content.get_texture(), null, 1, null);
  } catch (e) {
    logError(e as object, 'Error capturing screenshot');
  }
}

async function captureStage(): Promise<void> {
  try {
    const [content] = await new Shell.Screenshot().screenshot_stage_to_content();
    await captureScreenshot((content as Clutter.TextureContent).get_texture(), null, 1, null);
  } catch (e) {
    logError(e as object, 'Error capturing screenshot');
  }
}

export function addShortcuts(ui: ScreenshotUI): void {
  const uiModes = Shell.ActionMode.ALL & ~Shell.ActionMode.LOGIN_SCREEN;
  const restrictedModes = uiModes & ~(Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN);
  const add = (name: string, flags: Meta.KeyBindingFlags, modes: Shell.ActionMode, handler: Meta.KeyHandlerFunc) =>
    Main.wm.addKeybinding(name, new Gio.Settings({ schema_id: 'com.lantharos.kestrel.keybindings' }), flags, modes, handler);

  add('show-screenshot-ui', Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, uiModes,
    () => ui.open().catch(err => logError(err, 'Error opening the screenshot UI')));
  add('show-screen-recording-ui', Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, restrictedModes,
    () => ui.toggleScreenRecording());
  add('screenshot-window', Meta.KeyBindingFlags.IGNORE_AUTOREPEAT | Meta.KeyBindingFlags.PER_WINDOW, restrictedModes,
    (_display, window) => void captureWindow(window));
  add('screenshot', Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, uiModes, () => void captureStage());
}
