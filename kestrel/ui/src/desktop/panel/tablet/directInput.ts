class DirectInput {
  private readonly backend = global.backend;
  private readonly watchers = new Set<() => void>();
  private screens = this.find();

  constructor() {
    this.backend.connect('direct-input-changed', () => this.sync());
    this.backend.get_monitor_manager().connect('monitors-changed', () => this.sync());
  }

  private find(): Set<number> {
    const logicalMonitors = this.backend.get_monitor_manager().get_logical_monitors() ?? [];
    return new Set(logicalMonitors
      .filter(logical => !logical.get_monitors().some(monitor => monitor.is_builtin()) && this.backend.has_direct_input(logical))
      .map(logical => logical.get_number()));
  }

  private sync(): void {
    const screens = this.find();
    if (screens.size === this.screens.size && [...screens].every(screen => this.screens.has(screen))) return;
    this.screens = screens;
    this.watchers.forEach(watcher => watcher());
  }

  /** Whether people touch or draw on this screen itself, such as a pen display or a touch monitor, apart from a laptop's own screen. */
  on(monitorIndex: number): boolean {
    return this.screens.has(monitorIndex);
  }

  watch(watcher: () => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }
}

export const directInput = new DirectInput();
