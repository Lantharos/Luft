import type Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';

const CACHE_LIMIT = 512;

interface EmojiRenderer {
  render(text: string, size: number, scale: number): Clutter.Content | null;
}

const { EmojiRenderer } = Shell as unknown as { EmojiRenderer: new () => EmojiRenderer };

export class EmojiImages {
  private readonly renderer = new EmojiRenderer();
  private readonly cache = new Map<string, Clutter.Content | null>();

  constructor(private readonly size: number) {}

  get(text: string, scale: number): Clutter.Content | null {
    const key = `${scale} ${text}`;
    const cached = this.cache.get(key);
    const content = cached === undefined ? this.renderer.render(text, this.size, scale) : cached;
    this.cache.delete(key);
    this.cache.set(key, content);
    if (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value!);
    return content;
  }
}
