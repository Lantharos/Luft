import { contrast, fromHex, isNeutral, type Rgb, type Seed } from '../../../appearance/color.js';
import type { Colors, Palette } from '../../../appearance/palette.js';
import { rgba } from '../../../appearance/stylesheet.js';
import { wallpaperFloor } from '../../wallpaper/floor.js';
import { backdropsBehind, type PanelSurface } from '../backdrop.js';
import type { TaskbarLook } from '../../../../../../packages/web/ui/src/taskbar/looks';
import { schemeThemes, type Halo, type Scheme, type SchemeTheme } from './schemeThemes.js';
import { taskbarScheme } from './taskbarScheme.js';

const TEXT_CONTRAST = 4.5;
const COMFORTABLE_CONTRAST = 5;
const ACCENT_OPACITY = 0.62;
const OTHER: Record<Scheme, Scheme> = { light: 'dark', dark: 'light' };

export interface Tints {
  solid: string;
  accent: string;
}

interface Surface {
  look: TaskbarLook;
  opaque: boolean;
  surface: PanelSurface;
}

export interface LookInk extends Surface {
  backdrops: Rgb[];
  ink: Scheme;
  halo: Halo;
  backed: boolean;
}

const selector = (look: TaskbarLook, opaque = false) => `.kestrel-panel.kestrel-panel.kestrel-taskbar-${look}${opaque ? '.kestrel-taskbar-opaque' : ''}`;
const worst = (ink: Rgb, backdrops: Rgb[]) => Math.min(...backdrops.map(backdrop => contrast(ink, backdrop)));

export function tintsOf(seed: Seed, colors: Colors): Tints {
  return { solid: colors.surfaceContainer, accent: isNeutral(seed) ? colors.surfaceContainerHighest : colors.primaryContainer };
}

const shading = ({ glass }: PanelSurface) => glass
  ? ` -kestrel-glass-dim: ${glass.dim}; -kestrel-glass-lift: ${glass.lift}; -kestrel-glass-saturation: ${glass.saturation};`
  : '';

// The stylesheet of each style gives the taskbar that style's glass; a
// taskbar that takes the other one over its wallpaper gets it here
function surfaceRules(style: Scheme, scheme: Scheme): string {
  if (scheme === style) return '';
  const glass = schemeThemes()[scheme].surface('kestrel-taskbar-glass', true);
  return `${selector('glass')} { background-color: rgba(${glass.tint.join(', ')}, ${glass.opacity});${shading(glass)} }
${selector('accent')} {${shading(glass)} }
`;
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
  if (own >= COMFORTABLE_CONTRAST) return scheme;
  return worst(themes[OTHER[scheme]].ink, backdrops) > own ? OTHER[scheme] : scheme;
}

function inkOver(surface: Surface, scheme: Scheme, themes: Record<Scheme, SchemeTheme>) {
  const backdrops = backdropsBehind(surface.surface, wallpaperFloor);
  const ink = inkFor(scheme, backdrops, themes);
  return { ...surface, backdrops, ink, contrast: worst(themes[ink].ink, backdrops) };
}

const backing = (theme: SchemeTheme) => theme.surface('kestrel-taskbar-glass kestrel-panel-backed', true);

function needsBacking({ look, opaque }: Surface, contrast: number): boolean {
  return look === 'glass' && !opaque && wallpaperFloor.busy && contrast < COMFORTABLE_CONTRAST;
}

function haloFor(look: TaskbarLook, readable: boolean): Halo {
  if (readable) return 'no-halo';
  if (look !== 'transparent') return 'status-halo';
  return wallpaperFloor.busy ? 'strong-halo' : 'no-halo';
}

export function lookInks(scheme: Scheme, tints: Tints): LookInk[] {
  const themes = schemeThemes();
  return surfaces(themes[scheme], tints).map(surface => {
    const plain = inkOver(surface, scheme, themes);
    const backed = needsBacking(surface, plain.contrast);
    const { contrast, ...choice } = backed ? inkOver({ ...surface, surface: backing(themes[scheme]) }, scheme, themes) : plain;
    return { ...choice, backed, halo: haloFor(surface.look, contrast >= TEXT_CONTRAST) };
  });
}

function inkRules(style: Scheme, scheme: Scheme, palette: Palette, tints: Tints): string {
  if (!wallpaperFloor.color) return '';
  const themes = schemeThemes();
  const chosen = new Map<TaskbarLook, LookInk>();
  let css = '';
  for (const choice of lookInks(scheme, tints)) {
    const { look, opaque, ink, halo, backed, surface } = choice;
    const inherited = opaque ? chosen.get(look)! : { ink: style, halo: 'no-halo', backed: false };
    chosen.set(look, choice);
    const target = selector(look, opaque);
    if (backed || inherited.backed) css += `${target} { background-color: rgba(${surface.tint.join(', ')}, ${surface.opacity}); }\n`;
    if (ink !== inherited.ink) {
      css += themes[ink].rules('ink', target);
      css += `${target} .kestrel-app-focused .kestrel-running-dot, ${target} .kestrel-task-progress-fill { background-color: ${palette[ink].colors.primary}; }\n`;
    }
    if (look === 'transparent' && ink !== style) css += themes[ink].rules('soft-halo', target);
    if (halo !== inherited.halo || (halo !== 'no-halo' && ink !== inherited.ink)) css += themes[ink].rules(halo, target);
  }
  return css;
}

export function taskbarStylesheet(seed: Seed, palette: Palette, style: Scheme, pureBlack: boolean): string {
  const scheme = taskbarScheme(style, pureBlack && style === 'dark', wallpaperFloor);
  const tints = tintsOf(seed, palette[scheme].colors);
  return `${surfaceRules(style, scheme)}${selector('solid')} { background-color: ${tints.solid}; }
${selector('accent')} { background-color: ${rgba(tints.accent, ACCENT_OPACITY)}; }
${selector('accent', true)} { background-color: ${tints.accent}; }
${inkRules(style, scheme, palette, tints)}`;
}
