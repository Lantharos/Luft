import type { PidFd } from '../../shared/dbus/processes.js';

class OwnDictation {
  private listening = false;
  private service: PidFd | null = null;
  private readonly listeners = new Set<() => void>();

  get active(): boolean {
    return this.listening;
  }

  set active(listening: boolean) {
    if (this.listening === listening) return;
    this.listening = listening;
    this.notify();
  }

  get pid(): number {
    return this.service?.pid ?? 0;
  }

  set process(service: PidFd | null) {
    if (!service && !this.service) return;
    this.service?.close();
    this.service = service;
    this.notify();
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

export const ownDictation = new OwnDictation();
