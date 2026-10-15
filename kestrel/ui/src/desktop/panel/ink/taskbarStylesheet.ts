import { contrast, fromHex, isNeutral, type Rgb, type Seed } from '../../../appearance/color.js';
import type { Colors, Palette } from '../../../appearance/palette.js';
import { rgba } from '../../../appearance/stylesheet.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';
import { backdropsBehind, type PanelSurface } from '../backdrop.js';
import type { TaskbarLook } from '../preferences/taskbarPreferences.js';
import { schemeThemes, type Halo, type Scheme, type SchemeTheme } from './schemeThemes.js';

const TEXT_CONTRAST = 4.5;
const ACCENT_OPACITY = 0.62;
const OTHER: Record<Scheme, Scheme> = { light: 'dark', dark: 'light' };

interface Tints {
  solid: string;
  accent: string;
}

interface Surface {
  look: TaskbarLook;
  opaque: boolean;
  surface: PanelSurface;
}

const selector = (look: TaskbarLook, opaque = false) => `.kestrel-panel.kestrel-panel.kestrel-taskbar-${look}${opaque ? '.kestrel-taskbar-opaque' : ''}`;
const worst = (ink: Rgb, backdrops: Rgb[]) => Math.min(...backdrops.map(backdrop => contrast(ink, backdrop)));

function tintsOf(seed: Seed, colors: Colors): Tints {
  return { solid: colors.surfaceContainer, accent: isNeutral(seed) ? colors.surfaceContainerHighest : colors.primaryContainer };
}

function surfaces(theme: SchemeTheme, tints: Tints): Surface[] {
  const glass = theme.surface('kestrel-taskbar-glass', true);
  const accent = fromHex(tints.accent);
  const looks: Surface[] = [
    { look: 'glass', opaque: false, surface: glass },
    { look: 'solid', opaque: false, surface: { tint: fromHex(tints.solid), opacity: 1, glass: null } },
    { look: 'transparent', opaque: false, surface: theme.surface('kestrel-taskbar-transparent', false) },
    { look: 'accent', opaque: false, surface: { tint: accent, opacity: ACCENT_OPACITY, glass: glass.glass } },
  ];
  if (theme.scheme === 'light') return looks;
  return [
    ...looks,
    { look: 'glass', opaque: true, surface: theme.surface('kestrel-taskbar-glass kestrel-taskbar-opaque', false) },
    { look: 'accent', opaque: true, surface: { tint: accent, opacity: 1, glass: null } },
  ];
}

function inkFor(scheme: Scheme, backdrops: Rgb[], themes: Record<Scheme, SchemeTheme>): Scheme {
  const own = worst(themes[scheme].ink, backdrops);
  if (own >= TEXT_CONTRAST) return scheme;
  return worst(themes[OTHER[scheme]].ink, backdrops) > own ? OTHER[scheme] : scheme;
}

interface Choice {
  ink: Scheme;
  halo: Halo;
}

function haloFor(look: TaskbarLook, readable: boolean): Halo {
  if (readable) return 'no-halo';
  if (look !== 'transparent') return 'status-halo';
  return wallpaperFloor.busy ? 'strong-halo' : 'no-halo';
}

function inkRules(scheme: Scheme, palette: Palette, tints: Tints): string {
  if (!wallpaperFloor.color) return '';
  const themes = schemeThemes();
  const chosen = new Map<TaskbarLook, Choice>();
  let css = '';
  for (const { look, opaque, surface } of surfaces(themes[scheme], tints)) {
    const backdrops = backdropsBehind(surface, wallpaperFloor);
    const ink = inkFor(scheme, backdrops, themes);
    const halo = haloFor(look, worst(themes[ink].ink, backdrops) >= TEXT_CONTRAST);
    const inherited = opaque ? chosen.get(look)! : { ink: scheme, halo: 'no-halo' };
    chosen.set(look, { ink, halo });
    const target = selector(look, opaque);
    if (ink !== inherited.ink) {
      css += themes[ink].rules('ink', target);
      css += `${target} .kestrel-app-focused .kestrel-running-dot, ${target} .kestrel-task-progress-fill { background-color: ${palette[ink].colors.primary}; }\n`;
    }
    if (look === 'transparent' && ink !== scheme) css += themes[ink].rules('soft-halo', target);
    if (halo !== inherited.halo || (halo !== 'no-halo' && ink !== inherited.ink)) css += themes[ink].rules(halo, target);
  }
  return css;
}

export function taskbarStylesheet(seed: Seed, palette: Palette, scheme: Scheme): string {
  const tints = tintsOf(seed, palette[scheme].colors);
  return `${selector('solid')} { background-color: ${tints.solid}; }
${selector('accent')} { background-color: ${rgba(tints.accent, ACCENT_OPACITY)}; }
${selector('accent', true)} { background-color: ${tints.accent}; }
${inkRules(scheme, palette, tints)}`;
}
