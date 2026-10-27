import type Clutter from 'gi://Clutter';
import type Shell from 'gi://Shell';

const CACHE_LIMIT = 512;

export interface Glyph {
  readonly content: Clutter.Content;
  readonly width: number;
  readonly height: number;
}

export class GlyphImages {
  private readonly cache = new Map<string, Glyph | null>();

  constructor(private readonly renderer: Shell.GlyphRenderer, private readonly size: number) {}

  get(text: string, scale: number): Glyph | null {
    const key = `${scale} ${text}`;
    const cached = this.cache.get(key);
    const glyph = cached === undefined ? this.render(text, scale) : cached;
    this.cache.delete(key);
    this.cache.set(key, glyph);
    if (this.cache.size > CACHE_LIMIT) this.cache.delete(this.cache.keys().next().value!);
    return glyph;
  }

  private render(text: string, scale: number): Glyph | null {
    const content = this.renderer.render(text, this.size, scale);
    if (!content) return null;
    const [, width, height] = content.get_preferred_size();
    return { content, width, height };
  }
}
