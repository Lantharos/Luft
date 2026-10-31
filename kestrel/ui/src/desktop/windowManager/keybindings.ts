import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as KestrelUi from '../../kestrelUi.js';
import { recoverDisplays } from '../../system/display/relight/monitorWake.js';
import type { WindowManager } from './windowManager.js';

const SHELL_KEYBINDINGS_SCHEMA = 'com.lantharos.kestrel.keybindings';
const SESSIONS = 12;
const NUMBERED_WORKSPACES = 12;
const SHORTCUT_WORKSPACES = 10;

const NORMAL = Shell.ActionMode.NORMAL;
const DESKTOP = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;
const DESKTOP_AND_POPUPS = DESKTOP | Shell.ActionMode.POPUP;
const EVERYWHERE_BUT_SYSTEM_MODALS = DESKTOP | Shell.ActionMode.LOCK_SCREEN | Shell.ActionMode.UNLOCK_SCREEN | Shell.ActionMode.LOGIN_SCREEN;

const numbered = (count: number, name: (index: number) => string) => Array.from({ length: count }, (_, i) => name(i + 1));

const allowedIn = (modes: Shell.ActionMode) => (name: string): [string, Shell.ActionMode] => [name, modes];

const WORKSPACE_KEYS = [
  ...['left', 'right', 'up', 'down', 'last'].map(target => `switch-to-workspace-${target}`).map(allowedIn(DESKTOP)),
  ...['left', 'right', 'up', 'down'].map(target => `move-to-workspace-${target}`).map(allowedIn(DESKTOP)),
  ...numbered(NUMBERED_WORKSPACES, index => `switch-to-workspace-${index}`).map(allowedIn(DESKTOP)),
  ...numbered(NUMBERED_WORKSPACES, index => `move-to-workspace-${index}`).map(allowedIn(NORMAL)),
  allowedIn(NORMAL)('move-to-workspace-last'),
];

const SWITCHER_KEYS = [
  'switch-applications', 'switch-group', 'switch-applications-backward', 'switch-group-backward',
  'switch-windows', 'switch-windows-backward', 'cycle-windows', 'cycle-windows-backward',
  'cycle-group', 'cycle-group-backward',
];

const SURFACE_KEYS: [string, Shell.ActionMode, () => void][] = [
  ['toggle-message-tray', DESKTOP_AND_POPUPS, () => KestrelUi.toggleSurface('notifications')],
  ['toggle-quick-settings', DESKTOP_AND_POPUPS, () => KestrelUi.toggleSurface('quick')],
  ['toggle-start', NORMAL, () => KestrelUi.toggleSurface('start')],
  ['clipboard-history', NORMAL, () => KestrelUi.toggleSurface('clipboard')],
  ['emoji-picker', NORMAL, () => KestrelUi.toggleSurface('emoji')],
  ['snap-layouts', NORMAL, () => KestrelUi.toggleSurface('snap')],
  ['system-monitor', DESKTOP_AND_POPUPS, () => KestrelUi.openSystemMonitor()],
  ['relight-displays', EVERYWHERE_BUT_SYSTEM_MODALS, () => recoverDisplays().catch(logError)],
];

export interface KeyHandlers {
  workspaceSwitcher: Meta.KeyHandlerFunc;
  switcher: Meta.KeyHandlerFunc;
  a11ySwitcher: Meta.KeyHandlerFunc;
}

export function bindKeys(wm: WindowManager, { workspaceSwitcher, switcher, a11ySwitcher }: KeyHandlers): void {
  for (const name of numbered(SESSIONS, index => `switch-to-session-${index}`))
    wm.allowKeybinding(name, Shell.ActionMode.ALL);

  for (const [name, modes] of WORKSPACE_KEYS)
    wm.setCustomKeybindingHandler(name, modes, workspaceSwitcher);

  for (const name of SWITCHER_KEYS)
    wm.setCustomKeybindingHandler(name, NORMAL, switcher);

  wm.setCustomKeybindingHandler('switch-panels', EVERYWHERE_BUT_SYSTEM_MODALS, a11ySwitcher);
  wm.setCustomKeybindingHandler('switch-panels-backward', EVERYWHERE_BUT_SYSTEM_MODALS, a11ySwitcher);
  wm.setCustomKeybindingHandler('switch-monitor', DESKTOP, switcher);

  const settings = new Gio.Settings({ schema_id: SHELL_KEYBINDINGS_SCHEMA });
  for (const [name, modes, handler] of SURFACE_KEYS)
    wm.addKeybinding(name, settings, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, modes, handler);

  for (let index = 1; index <= SHORTCUT_WORKSPACES; index++) {
    wm.addKeybinding(`workspace-${index}`, settings, Meta.KeyBindingFlags.IGNORE_AUTOREPEAT, NORMAL,
      () => KestrelUi.switchWorkspace(index - 1));
  }
}
