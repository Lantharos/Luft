import GLib from 'gi://GLib';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

export type ListedWindow = [pid: number, unit: string, app: string, name: string, focused: boolean, fullscreen: boolean];

export interface Closed {
  app: string;
  name: string;
}

interface Tracked {
  unit: string;
  signals: number[];
}

const LISTED_TYPES = [Meta.WindowType.NORMAL, Meta.WindowType.DIALOG, Meta.WindowType.MODAL_DIALOG];
const WINDOW_SIGNALS = ['notify::fullscreen', 'notify::title'] as const;
const REMEMBER_CLOSED_MS = 10_000;
const decoder = new TextDecoder();

function unitOf(pid: number): string {
  let cgroup: string;
  try {
    cgroup = decoder.decode(GLib.file_get_contents(`/proc/${pid}/cgroup`)[1]);
  } catch {
    return '';
  }
  const path = cgroup.split('\n').find(line => line.startsWith('0::'))?.slice(3).split('/') ?? [];
  const manager = path.findIndex(part => part.startsWith('user@') && part.endsWith('.service'));
  return manager < 0 ? '' : path.slice(manager + 1).find(part => !part.endsWith('.slice')) ?? '';
}

function appOf(window: Meta.Window): Closed {
  const app = Shell.WindowTracker.get_default().get_window_app(window);
  return app && !app.is_window_backed() ? { app: app.get_id(), name: app.get_name() } : { app: '', name: window.title ?? '' };
}

export class MemoryWindows {
  private readonly windows = new Map<Meta.Window, Tracked>();
  private readonly closed: (Closed & { unit: string; at: number })[] = [];
  private readonly signals: [{ disconnect(id: number): void }, number][];
  private listed: ListedWindow[] = [];
  private later = 0;

  constructor(private readonly changed: (windows: ListedWindow[]) => void) {
    const { display } = global;
    const tracker = Shell.WindowTracker.get_default();
    this.signals = [
      [display, display.connect('window-created', (_display, window: Meta.Window) => this.track(window))],
      [display, display.connect('notify::focus-window', () => this.schedule())],
      [tracker, tracker.connect('tracked-windows-changed', () => this.schedule())],
    ];
    for (const window of display.list_all_windows()) this.track(window);
  }

  get current(): ListedWindow[] {
    return this.listed;
  }

  recentlyClosed(unit: string): Closed | null {
    const since = GLib.get_monotonic_time() / 1000 - REMEMBER_CLOSED_MS;
    return this.closed.find(closed => closed.unit === unit && closed.at >= since) ?? null;
  }

  destroy(): void {
    if (this.later) global.compositor.get_laters().remove(this.later);
    for (const [object, id] of this.signals) object.disconnect(id);
    for (const [window, { signals }] of this.windows) signals.forEach(id => window.disconnect(id));
    this.windows.clear();
  }

  private track(window: Meta.Window): void {
    if (this.windows.has(window) || window.is_override_redirect() || !LISTED_TYPES.includes(window.window_type)) return;
    const unit = unitOf(window.get_pid());
    if (!unit) return;
    const signals = WINDOW_SIGNALS.map(signal => window.connect(signal, () => this.schedule()));
    signals.push(window.connect('unmanaged', () => this.untrack(window)));
    this.windows.set(window, { unit, signals });
    this.schedule();
  }

  private untrack(window: Meta.Window): void {
    const tracked = this.windows.get(window);
    if (!tracked) return;
    tracked.signals.forEach(id => window.disconnect(id));
    this.windows.delete(window);
    const now = GLib.get_monotonic_time() / 1000;
    const kept = this.closed.findIndex(closed => closed.at >= now - REMEMBER_CLOSED_MS);
    this.closed.splice(0, kept < 0 ? this.closed.length : kept);
    this.closed.push({ ...appOf(window), unit: tracked.unit, at: now });
    this.schedule();
  }

  private schedule(): void {
    if (this.later) return;
    this.later = global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.later = 0;
      this.publish();
      return false;
    });
  }

  private publish(): void {
    const focused = global.display.focus_window;
    const listed = [...this.windows]
      .sort(([a], [b]) => b.get_user_time() - a.get_user_time())
      .map(([window, { unit }]): ListedWindow => {
        const { app, name } = appOf(window);
        return [window.get_pid(), unit, app, name, window === focused, window.is_fullscreen()];
      });
    if (JSON.stringify(listed) === JSON.stringify(this.listed)) return;
    this.listed = listed;
    this.changed(listed);
  }
}
