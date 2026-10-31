import Gio from 'gi://Gio';

import type { TaskbarLook } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { isVertical, type Edge } from '../../../shared/layout/edge.js';
import { directInput } from '../tablet/directInput.js';
import { tabletMode } from '../tablet/tabletMode.js';

type TaskbarAlignment = 'center' | 'left';
type TaskbarStyle = 'bar' | 'floating' | 'separate';
type TaskbarSize = 'compact' | 'normal' | 'large';
type TaskbarAutoHide = 'never' | 'always' | 'windows';
type TaskbarDisplays = 'all' | 'primary';
type StartStyle = 'menu' | 'palette';

export interface TaskbarMetrics {
  thickness: number;
  button: number;
  icon: number;
  margin: number;
  radius: number;
  inset: number;
  gap: number;
}

const SIZES: Record<TaskbarSize, { thickness: number; button: number; icon: number }> = {
  compact: { thickness: 40, button: 34, icon: 22 },
  normal: { thickness: 48, button: 40, icon: 28 },
  large: { thickness: 56, button: 48, icon: 34 },
};
const TOUCH = { thickness: 64, button: 52, icon: 36 };
const FLOATING_MARGIN = 8;
const BAR_INSET = 4;
const TOUCH_INSET = 12;
const SLOT_GAP = 2;
const TOUCH_SLOT_GAP = 10;
export const STRIP_HEIGHT = 24;

const KEYS = ['taskbar-position', 'taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide', 'taskbar-show-pinned',
  'taskbar-displays', 'taskbar-windows-per-display', 'taskbar-windows-per-workspace', 'taskbar-shown', 'taskbar-start-button',
  'start-style', 'pure-black', 'rounded-window-corners'] as const;
export type TaskbarKey = typeof KEYS[number] | 'tablet';

class TaskbarPreferences {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly watchers = new Set<(key: TaskbarKey) => void>();
  private readonly screens = new Map<number, TaskbarLayout>();
  readonly desktop = new TaskbarLayout(this.settings, () => tabletMode.active);

  constructor() {
    for (const key of KEYS) this.settings.connect(`changed::${key}`, () => this.notify(key));
    tabletMode.watch(() => this.notify('tablet'));
    directInput.watch(() => this.notify('tablet'));
  }

  private notify(key: TaskbarKey): void {
    this.watchers.forEach(watcher => watcher(key));
  }

  /** The taskbar as it's laid out on the screen with this index: for touch on screens people touch or draw on, as chosen on the others. */
  on(monitorIndex: number | undefined): TaskbarLayout {
    if (monitorIndex === undefined || monitorIndex < 0) return this.desktop;
    let layout = this.screens.get(monitorIndex);
    if (!layout) {
      layout = new TaskbarLayout(this.settings, () => tabletMode.active || directInput.on(monitorIndex));
      this.screens.set(monitorIndex, layout);
    }
    return layout;
  }

  get alignment(): TaskbarAlignment { return this.settings.get_string('taskbar-alignment') as TaskbarAlignment; }
  get look(): TaskbarLook { return this.settings.get_string('taskbar-look') as TaskbarLook; }
  get startStyle(): StartStyle { return this.settings.get_string('start-style') as StartStyle; }
  get showPinned(): boolean { return this.settings.get_boolean('taskbar-show-pinned'); }
  get displays(): TaskbarDisplays { return this.settings.get_string('taskbar-displays') as TaskbarDisplays; }
  get windowsPerDisplay(): boolean { return this.settings.get_boolean('taskbar-windows-per-display'); }
  get windowsPerWorkspace(): boolean { return this.settings.get_boolean('taskbar-windows-per-workspace'); }
  get pureBlack(): boolean { return this.settings.get_boolean('pure-black'); }

  watch(watcher: (key: TaskbarKey) => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }
}

export class TaskbarLayout {
  constructor(private readonly settings: Gio.Settings, private readonly touchHere: () => boolean) {}

  get touch(): boolean { return this.touchHere(); }

  get edge(): Edge { return this.touch ? 'bottom' : this.settings.get_string('taskbar-position') as Edge; }
  get vertical(): boolean { return isVertical(this.edge); }
  get style(): TaskbarStyle { return this.touch ? 'bar' : this.settings.get_string('taskbar-style') as TaskbarStyle; }
  get size(): TaskbarSize { return this.settings.get_string('taskbar-size') as TaskbarSize; }
  get autoHide(): TaskbarAutoHide { return this.touch ? 'never' : this.settings.get_string('taskbar-auto-hide') as TaskbarAutoHide; }
  get shown(): boolean { return this.touch || this.settings.get_boolean('taskbar-shown'); }
  get startButton(): boolean { return this.touch || this.settings.get_boolean('taskbar-start-button'); }

  get metrics(): TaskbarMetrics {
    if (this.touch) return { ...TOUCH, margin: 0, radius: 0, inset: TOUCH_INSET, gap: TOUCH_SLOT_GAP };
    const size = SIZES[this.size];
    const style = this.style;
    const lifted = style !== 'bar';
    return {
      ...size,
      margin: lifted ? FLOATING_MARGIN : 0,
      radius: lifted && this.settings.get_boolean('rounded-window-corners') ? size.thickness / 2 : 0,
      inset: style === 'floating' ? Math.round(size.thickness / 4) : style === 'separate' ? 0 : BAR_INSET,
      gap: SLOT_GAP,
    };
  }

  get clearance(): number {
    if (!this.shown) return 0;
    const { thickness, margin } = this.metrics;
    return thickness + margin;
  }

  get reserved(): number {
    return this.touch ? STRIP_HEIGHT : this.clearance;
  }
}

export const taskbarPreferences = new TaskbarPreferences();
