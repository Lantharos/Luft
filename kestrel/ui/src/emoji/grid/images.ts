import type Clutter from 'gi://Clutter';
import type Cogl from 'gi://Cogl';
import Shell from 'gi://Shell';

const CACHE_LIMIT = 512;

export interface GlyphRenderer {
  render(text: string, size: number, scale: number): Clutter.Content | null;
}

export const { GlyphRenderer } = Shell as unknown as {
  GlyphRenderer: { new_for_emoji(): GlyphRenderer; new_for_text(family: string, color: Cogl.Color): GlyphRenderer };
};

export class GlyphImages {
  private readonly cache = new Map<string, Clutter.Content | null>();

  constructor(private readonly renderer: GlyphRenderer, private readonly size: number) {}

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
