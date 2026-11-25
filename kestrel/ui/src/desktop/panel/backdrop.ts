import Gio from 'gi://Gio';
import type St from 'gi://St';

import type { GlassShading } from '../../../../../packages/web/ui/src/taskbar/looks';
import type { Rgb } from '../../appearance/color.js';
import type { Backdrop } from '../wallpaper/floor.js';
import { blendLuma, setLuminosity, type Channels } from '../../appearance/glass/blend.js';
import type { NikoGlass } from '../../appearance/glass/styles.js';
import { clampUnit } from '../../shared/math.js';

export interface PanelSurface {
  tint: Rgb;
  opacity: number;
  glass: GlassShading | null;
}

const LUMA: Channels = [0.2126, 0.7152, 0.0722];
const glassSettings = new Gio.Settings({ schema_id: 'com.lantharos.kestrel.glass' });

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

const channels = ({ red, green, blue }: { red: number; green: number; blue: number }): Channels => [red / 255, green / 255, blue / 255];

function coverLikeMaris(color: Channels, covered: number): Channels {
  const [surface, luminosity] = global.compositor.get_glass_surface();
  const tint = channels(surface);
  const amount = Math.max(0, 1 - (1 - surface.alpha / 255) / (1 - covered));
  return mix(mix(color, setLuminosity(color, blendLuma(tint)), luminosity), tint, amount);
}

export function shownNiko(): NikoGlass {
  const [{ red, green, blue, alpha }, luminosity] = global.compositor.get_niko_tint();
  return { tint: [red, green, blue], share: alpha / 255, luminosity };
}

function tintLikeNiko(color: Channels, { tint, share, luminosity }: NikoGlass): Channels {
  const tinted = tint.map(channel => channel / 255) as Channels;
  const lit = mix(color, setLuminosity(color, blendLuma(tinted)), luminosity);
  return mix(lit, setLuminosity(tinted, blendLuma(lit)), share);
}

function cancelledUnder(target: Channels, over: Channels, opacity: number): Channels {
  if (opacity >= 1) return over;
  return target.map((value, index) =>
    clampUnit((value - over[index] * opacity) / (1 - opacity)) * (1 - opacity) + over[index] * opacity) as Channels;
}

export function panelSurface(node: St.ThemeNode, blurred: boolean): PanelSurface {
  const { red, green, blue, alpha } = node.get_background_color();
  return { tint: [red, green, blue], opacity: alpha / 255, glass: blurred ? glassShading(node) : null };
}

export function backdropsBehind({ tint, opacity, glass }: PanelSurface, floor: Backdrop, niko: NikoGlass,
  material = glassSettings.get_string('taskbar')): Rgb[] {
  if (!floor.color) return [];
  const over = tint.map(channel => channel / 255) as Channels;
  return [floor.color, ...floor.extremes].map(color => {
    const behind = color.map(channel => channel / 255) as Channels;
    const style = glass && material;
    const shown = style === 'niko' ? cancelledUnder(tintLikeNiko(behind, niko), over, opacity) :
      mix(style === 'maris' ? coverLikeMaris(behind, opacity) : glass ? shadeLikeGlass(behind, glass) : behind, over, opacity);
    return shown.map(channel => Math.round(channel * 255)) as Rgb;
  });
}

export function taskbarBackdrops(panel: St.Widget, floor: Backdrop, material?: string): Rgb[] {
  const node = panel.peek_theme_node();
  return node ? backdropsBehind(panelSurface(node, !!panel.get_effect('backdrop')?.enabled), floor, shownNiko(), material) : [];
}

