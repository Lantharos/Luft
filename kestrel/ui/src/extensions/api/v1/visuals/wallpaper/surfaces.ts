import Meta from 'gi://Meta';

import { watchTaskbarShapes } from '../../../../../desktop/panel/islands/shapes.js';
import type { ExtensionHost } from '../../../../host.js';
import type { Surface, SurfaceDisplay } from '../../types.js';
import { isSurface, outline } from './windows.js';

const WINDOW_SIGNALS = ['position-changed', 'size-changed', 'notify::minimized', 'notify::fullscreen', 'workspace-changed', 'shown'] as const;

interface StageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function touches(rect: StageRect, area: StageRect): boolean {
  return rect.x < area.x + area.width && rect.x + rect.width > area.x && rect.y < area.y + area.height && rect.y + rect.height > area.y;
}

const windowId = (window: Meta.Window) => `window:${window.get_stable_sequence()}`;

export function windowWithId(id: string): Meta.Window | null {
  return global.get_window_actors().find(actor => windowId(actor.meta_window!) === id)?.meta_window ?? null;
}

function displayId(index: number): string {
  const manager = global.backend.get_monitor_manager();
  const [monitor] = manager.get_logical_monitors()!.find(logical => logical.get_number() === index)!.get_monitors();
  const serial = monitor.get_serial();
  return serial ? `${monitor.get_vendor()}:${monitor.get_product()}:${serial}` : monitor.get_connector();
}

export class SurfaceWatch {
  private readonly listeners = new Set<() => void>();
  private readonly followed = new Map<Meta.Window, number[]>();
  private stops: (() => void)[] = [];
  private queued = 0;

  constructor(private readonly host: ExtensionHost) {}

  displays(): SurfaceDisplay[] {
    const workspace = global.workspace_manager.get_active_workspace();
    const windows = global.display.sort_windows_by_stacking(workspace.list_windows().filter(window => isSurface(window, workspace))).reverse();
    const shapes = windows.map((window): Surface => ({ ...outline(window), id: windowId(window) }));
    const primary = this.host.primaryIndex();
    return this.host.monitors().map(monitor => {
      const relative = (shape: Surface): Surface => ({ ...shape, x: shape.x - monitor.x, y: shape.y - monitor.y });
      const area = this.host.workArea(monitor.index);
      return {
        index: monitor.index,
        id: displayId(monitor.index),
        primary: monitor.index === primary,
        x: monitor.x,
        y: monitor.y,
        width: monitor.width,
        height: monitor.height,
        scale: global.display.get_monitor_scale(monitor.index),
        workArea: { ...area, x: area.x - monitor.x, y: area.y - monitor.y },
        fullscreen: windows.some(window => window.is_fullscreen() && window.get_monitor() === monitor.index),
        windows: shapes.filter(shape => touches(shape, monitor)).map(relative),
        taskbar: this.host.taskbarIslands(monitor).map(({ x, y, width, height, radius }, index) =>
          relative({ x, y, width, height, radii: [radius, radius, radius, radius], id: `taskbar:${index}` })),
      };
    });
  }

  watch(changed: () => void): () => void {
    if (!this.listeners.size) this.start();
    this.listeners.add(changed);
    return () => {
      this.listeners.delete(changed);
      if (!this.listeners.size) this.stop();
    };
  }

  private start(): void {
    const { display, workspace_manager: workspaces } = global;
    const queue = () => this.queue();
    const created = display.connect('window-created', (_display, window: Meta.Window) => this.follow(window));
    const switched = workspaces.connect('active-workspace-changed', queue);
    this.stops = [
      () => display.disconnect(created),
      () => workspaces.disconnect(switched),
      this.host.desktop.watch(queue),
      this.host.watchMonitors(queue),
      watchTaskbarShapes(queue),
    ];
    for (const actor of global.get_window_actors()) this.follow(actor.meta_window!);
  }

  private stop(): void {
    for (const stop of this.stops.splice(0)) stop();
    for (const [window, signals] of this.followed) signals.forEach(signal => window.disconnect(signal));
    this.followed.clear();
    if (this.queued) global.compositor.get_laters().remove(this.queued);
    this.queued = 0;
  }

  private follow(window: Meta.Window): void {
    const queue = () => this.queue();
    const gone = window.connect('unmanaged', () => {
      this.followed.get(window)?.forEach(signal => window.disconnect(signal));
      this.followed.delete(window);
      this.queue();
    });
    this.followed.set(window, [gone, ...WINDOW_SIGNALS.map(signal => window.connect(signal as 'shown', queue))]);
    this.queue();
  }

  private queue(): void {
    this.queued ||= global.compositor.get_laters().add(Meta.LaterType.BEFORE_REDRAW, () => {
      this.queued = 0;
      for (const listener of [...this.listeners]) listener();
      return false;
    });
  }
}
