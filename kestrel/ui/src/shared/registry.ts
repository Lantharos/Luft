export class Registry<Item> {
  private readonly entries: Item[] = [];
  private readonly listeners = new Set<(item: Item, added: boolean) => void>();

  get items(): readonly Item[] {
    return this.entries;
  }

  add(item: Item): () => void {
    this.entries.push(item);
    for (const listener of [...this.listeners]) listener(item, true);
    return () => {
      const index = this.entries.indexOf(item);
      if (index < 0) return;
      this.entries.splice(index, 1);
      for (const listener of [...this.listeners]) listener(item, false);
    };
  }

  watch(changed: (item: Item, added: boolean) => void): () => void {
    this.listeners.add(changed);
    return () => this.listeners.delete(changed);
  }
}
