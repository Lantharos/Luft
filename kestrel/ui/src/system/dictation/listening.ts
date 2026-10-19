class OwnDictation {
  private listening = false;
  private readonly listeners = new Set<() => void>();

  get active(): boolean {
    return this.listening;
  }

  set active(listening: boolean) {
    if (this.listening === listening) return;
    this.listening = listening;
    for (const listener of this.listeners) listener();
  }

  watch(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const ownDictation = new OwnDictation();
