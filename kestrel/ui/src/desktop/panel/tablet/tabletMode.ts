import type Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';

class TabletMode {
  private readonly seat: Clutter.Seat = (global as unknown as Shell.Global).stage.context.get_backend().get_default_seat();
  private readonly watchers = new Set<() => void>();
  private current = this.seat.touch_mode;

  constructor() {
    this.seat.connect('notify::touch-mode', () => {
      if (this.seat.touch_mode === this.current) return;
      this.current = this.seat.touch_mode;
      this.watchers.forEach(watcher => watcher());
    });
  }

  get active(): boolean {
    return this.current;
  }

  watch(watcher: () => void): () => void {
    this.watchers.add(watcher);
    return () => this.watchers.delete(watcher);
  }
}

export const tabletMode = new TabletMode();
