import type St from 'gi://St';

import type { GlassShading } from '../../../../../packages/web/ui/src/taskbar/looks';
import type { Rgb } from '../../appearance/color.js';
import type { WallpaperFloor } from '../wallpaper/floor.js';
import { clampUnit } from '../../shared/math.js';

type Channels = [number, number, number];

export interface PanelSurface {
  tint: Rgb;
  opacity: number;
  glass: GlassShading | null;
}

const LUMA: Channels = [0.2126, 0.7152, 0.0722];

const luma = (color: Channels) => color.reduce((sum, channel, index) => sum + channel * LUMA[index], 0);
const mix = (from: Channels, to: Channels, amount: number) => from.map((value, index) => value + (to[index] - value) * amount) as Channels;

function smoothstep(low: number, high: number, value: number): number {
  const t = clampUnit((value - low) / (high - low));
  return t * t * (3 - 2 * t);
}

function glassShading(node: St.ThemeNode): GlassShading {
  const lookup = (property: string, fallback: number) => {
    const [found, value] = node.lookup_double(property, true);
    return found ? value : fallback;
  };
  return {
    dim: lookup('-kestrel-glass-dim', 0),
    lift: lookup('-kestrel-glass-lift', 0),
    saturation: lookup('-kestrel-glass-saturation', 1),
  };
}

function shadeLikeGlass(color: Channels, { dim, lift, saturation }: GlassShading): Channels {
  const brightness = luma(color);
  const dimmed = color.map(channel => channel * (1 - dim * smoothstep(0.3, 0.95, brightness))) as Channels;
  const lifted = mix(dimmed, [1, 1, 1], lift * (1 - smoothstep(0.1, 0.9, brightness)));
  const gray = luma(lifted);
  return mix([gray, gray, gray], lifted, saturation).map(clampUnit) as Channels;
}

export function panelSurface(node: St.ThemeNode, blurred: boolean): PanelSurface {
  const { red, green, blue, alpha } = node.get_background_color();
  return { tint: [red, green, blue], opacity: alpha / 255, glass: blurred ? glassShading(node) : null };
}

export function backdropsBehind({ tint, opacity, glass }: PanelSurface, floor: WallpaperFloor): Rgb[] {
  if (!floor.color) return [];
  const over = tint.map(channel => channel / 255) as Channels;
  return (glass ? [floor.color] : [floor.color, ...floor.extremes]).map(color => {
    const behind = color.map(channel => channel / 255) as Channels;
    const shaded = glass ? shadeLikeGlass(behind, glass) : behind;
    return mix(shaded, over, opacity).map(channel => Math.round(channel * 255)) as Rgb;
  });
}

export function taskbarBackdrops(panel: St.Widget, floor: WallpaperFloor): Rgb[] {
  const node = panel.peek_theme_node();
  return node ? backdropsBehind(panelSurface(node, !!panel.get_effect('backdrop')?.enabled), floor) : [];
}

