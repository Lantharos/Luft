import GLib from 'gi://GLib';

const SHOWN_FOR_S = 5;

class TypingActivity {
  private readonly typists = new Map<string, { name: string; settings: () => void; timer: number }>();
  private readonly listeners = new Set<() => void>();

  get active(): { name: string; settings: () => void }[] {
    return [...this.typists.values()];
  }

  typed(id: string, name: string, settings: () => void): void {
    const previous = this.typists.get(id);
    if (previous) GLib.source_remove(previous.timer);
    const timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, SHOWN_FOR_S, () => {
      this.typists.delete(id);
      this.changed();
      return GLib.SOURCE_REMOVE;
    });
    this.typists.set(id, { name, settings, timer });
    if (!previous) this.changed();
  }

  watch(changed: () => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }

  private changed(): void {
    for (const listener of [...this.listeners]) listener();
  }
}

export const typingActivity = new TypingActivity();
