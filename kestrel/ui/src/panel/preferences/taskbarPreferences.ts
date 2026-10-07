import Gio from 'gi://Gio';

export type TaskbarAlignment = 'center' | 'left';
export type TaskbarLook = 'glass' | 'solid' | 'transparent' | 'accent';
export type TaskbarStyle = 'bar' | 'floating';
export type TaskbarSize = 'compact' | 'normal' | 'large';
export type TaskbarAutoHide = 'never' | 'always' | 'windows';
export type TaskbarDisplays = 'all' | 'primary';

export interface TaskbarMetrics {
  height: number;
  button: number;
  icon: number;
  margin: number;
  radius: number;
  inset: number;
}

const SIZES: Record<TaskbarSize, { height: number; button: number; icon: number }> = {
  compact: { height: 40, button: 34, icon: 22 },
  normal: { height: 48, button: 40, icon: 28 },
  large: { height: 56, button: 48, icon: 34 },
};
const FLOATING_MARGIN = 8;
const BAR_INSET = 4;

const KEYS = ['taskbar-alignment', 'taskbar-look', 'taskbar-style', 'taskbar-size', 'taskbar-auto-hide',
  'taskbar-show-pinned', 'taskbar-displays', 'taskbar-windows-per-display', 'pure-black'] as const;
export type TaskbarKey = typeof KEYS[number];

class TaskbarPreferences {
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly watchers = new Set<(key: TaskbarKey) => void>();

  constructor() {
    for (const key of KEYS) this.settings.connect(`changed::${key}`, () => this.watchers.forEach(watcher => watcher(key)));
  }

  get alignment(): TaskbarAlignment { return this.settings.get_string('taskbar-alignment') as TaskbarAlignment; }
  get look(): TaskbarLook { return this.settings.get_string('taskbar-look') as TaskbarLook; }
  get style(): TaskbarStyle { return this.settings.get_string('taskbar-style') as TaskbarStyle; }
  get size(): TaskbarSize { return this.settings.get_string('taskbar-size') as TaskbarSize; }
  get autoHide(): TaskbarAutoHide { return this.settings.get_string('taskbar-auto-hide') as TaskbarAutoHide; }
  get showPinned(): boolean { return this.settings.get_boolean('taskbar-show-pinned'); }
  get displays(): TaskbarDisplays { return this.settings.get_string('taskbar-displays') as TaskbarDisplays; }
  get windowsPerDisplay(): boolean { return this.settings.get_boolean('taskbar-windows-per-display'); }
  get pureBlack(): boolean { return this.settings.get_boolean('pure-black'); }

  get metrics(): TaskbarMetrics {
    const size = SIZES[this.size];
    const floating = this.style === 'floating';
    return {
      ...size,
      margin: floating ? FLOATING_MARGIN : 0,
      radius: floating ? size.height / 2 : 0,
      inset: floating ? Math.round(size.height / 4) : BAR_INSET,
    };
  }

  get clearance(): number {
    const { height, margin } = this.metrics;
    return height + margin;
  }

  watch(watcher: (key: TaskbarKey) => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }
}

export const taskbarPreferences = new TaskbarPreferences();
