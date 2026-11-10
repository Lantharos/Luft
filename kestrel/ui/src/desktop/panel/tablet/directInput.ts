import Gio from 'gi://Gio';
import type Meta from 'gi://Meta';

const OFF_KEY = 'touch-taskbar-off';

const screenKey = (monitor: Meta.Monitor) => `${monitor.get_vendor()}:${monitor.get_product()}:${monitor.get_serial()}`;

class DirectInput {
  private readonly backend = global.backend;
  private readonly settings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel' });
  private readonly watchers = new Set<() => void>();
  private screens = this.find();

  constructor() {
    this.backend.connect('direct-input-changed', () => this.sync());
    this.backend.get_monitor_manager().connect('monitors-changed', () => this.sync());
    this.settings.connect(`changed::${OFF_KEY}`, () => this.sync());
  }

  private find(): Set<number> {
    const off = new Set(this.settings.get_strv(OFF_KEY));
    const logicalMonitors = this.backend.get_monitor_manager().get_logical_monitors() ?? [];
    return new Set(logicalMonitors
      .filter(logical => {
        const [monitor, ...mirrors] = logical.get_monitors();
        return monitor && !mirrors.length && !monitor.is_builtin() && !off.has(screenKey(monitor)) &&
          this.backend.has_direct_input(logical);
      })
      .map(logical => logical.get_number()));
  }

  private sync(): void {
    const screens = this.find();
    if (screens.size === this.screens.size && [...screens].every(screen => this.screens.has(screen))) return;
    this.screens = screens;
    this.watchers.forEach(watcher => watcher());
  }

  on(monitorIndex: number): boolean {
    return this.screens.has(monitorIndex);
  }

  watch(watcher: () => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }
}

export const directInput = new DirectInput();
