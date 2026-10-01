import type Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import type Meta from 'gi://Meta';
import type Shell from 'gi://Shell';
import type Mtk from 'gi://Mtk';
import type St from 'gi://St';

import type { MessageTray } from './notifications/notificationCenter.js';
import type { Monitor } from './panel/panel.js';
import type { QuickSettingsSource } from './quickSettings/quickControls.js';
import type { Box } from './shared/placement.js';
import type { TextInput } from './shared/textInput.js';

export interface CaretPopup {
  readonly actor: St.BoxLayout;
  readonly available: boolean;
  readonly slideDistance: number;
  locate(): [number, number];
  place(limit: number, area: Box): void;
  open(): void;
  closed?(): void;
}

interface LayoutManager {
  primaryMonitor: Monitor | null;
  monitors: Monitor[];
  panelBox: St.Widget;
  addChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  addTopChrome(actor: Clutter.Actor, params?: Record<string, boolean>): void;
  removeChrome(actor: Clutter.Actor): void;
  getWorkAreaForMonitor(index: number): Mtk.Rectangle;
  connect(signal: string, callback: () => void): number;
  disconnect(id: number): void;
}

export interface Keybindings {
  add(name: string, settings: Gio.Settings, flags: Meta.KeyBindingFlags, modes: Shell.ActionMode, handler: () => void): void;
  allow(name: string, modes: Shell.ActionMode): void;
}

export interface Context {
  layoutManager: LayoutManager;
  messageTray: MessageTray;
  quickSettings: QuickSettingsSource;
  sessionMode: { isLocked: boolean; hasWindows: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void };
  screenShield: { active: boolean; connect(signal: string, callback: () => void): number; disconnect(id: number): void } | null;
  canInteract(): boolean;
  snapWindow(window: Meta.Window, rect: Mtk.Rectangle): void;
  activateWindow(window: Meta.Window): void;
  openScreenshot(): void;
  stopScreencast(): void;
  createBackground(container: Clutter.Actor, monitorIndex: number): { destroy(): void };
  registerPanel(actor: St.Widget): void;
  inputMethod: TextInput;
  keybindings: Keybindings;
  showOsd(icon: Gio.Icon, label: string | null, level: number | null, maxLevel: number): void;
}
