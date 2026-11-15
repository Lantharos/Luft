import type { Extension, PageGroupItem, PageSection, PageSubpage, SubpageSection } from '@luft/extension-api';

import type { Looks } from '../looks/looks.js';
import type { AppRules, Granted } from '../rules.js';
import { lookSection } from './looks.js';
import { ruleItems } from './rules.js';
import { anyOn, summary } from './summary.js';

const WINDOW_EFFECTS = ['border', 'overlay', 'shadow', 'unfocused'];
const MOTION = ['open-effect', 'close-effect'];
const SCREEN_EFFECTS = ['desktop-crt', 'vhs', 'glitch-bursts', 'chromatic-aberration', 'screen-grain', 'screen-vignette', 'pixelate', 'stylize'];
const COLOR_EFFECTS = ['grade', 'palette', 'bloom', 'invert', 'shadow-boost'];
const SURFACES = ['surface-lines', 'app-lines'];

const settingItems = (...keys: string[]): PageGroupItem[] => keys.map(setting => ({ setting }));
const card = (...keys: string[]): SubpageSection => ({ items: settingItems(...keys) });

function offSection(phosphor: Extension<Granted>): PageSection {
  const { t, screenEffects } = phosphor;
  return {
    title: t('safety'),
    items: [
      { type: 'row', title: t('safety-shortcut'), value: screenEffects.shortcut ?? t('safety-no-shortcut') },
      ...screenEffects.off ? [{ type: 'button' as const, title: t('safety-off'), label: t('safety-turn-on'), onActivate: () => screenEffects.turnBackOn() }] : [],
    ],
  };
}

function subpage(phosphor: Extension<Granted>, key: string, title: string, effects: readonly string[], sections: SubpageSection[]): PageSubpage {
  return { type: 'page', key, title: phosphor.t(title), value: effects.length ? summary(phosphor, effects) : undefined, sections };
}

const filtersPlace = (phosphor: Extension<Granted>): SubpageSection[] =>
  anyOn(phosphor, [...SCREEN_EFFECTS, ...COLOR_EFFECTS]) ? [card('filters-scope', 'filters-fullscreen', 'filters-captured')] : [];

function subpages(phosphor: Extension<Granted>, rules: AppRules): PageSubpage[] {
  const windowsOn = anyOn(phosphor, WINDOW_EFFECTS) || rules.used('crt') || rules.used('aberration');
  return [
    subpage(phosphor, 'windows', 'section-windows', WINDOW_EFFECTS, [
      card('border', 'border-color', 'border-app-color', 'border-second-color', 'border-width', 'border-glow-size', 'border-motion', 'border-speed', 'border-focused'),
      card('overlay', 'overlay-strength', 'overlay-tint-color', 'overlay-line-spacing', 'overlay-grain-size', 'overlay-vignette-size'),
      card('shadow', 'shadow-color', 'shadow-size', 'unfocused', 'unfocused-strength'),
      ...windowsOn ? [card('windows-fullscreen')] : [],
    ]),
    subpage(phosphor, 'motion', 'section-motion', MOTION, [card('open-effect', 'open-length', 'close-effect', 'close-length')]),
    subpage(phosphor, 'apps', 'section-rules', [], [
      { items: ruleItems(phosphor, rules) },
      { items: [...rules.used('crt') ? settingItems('window-crt') : [], ...rules.used('aberration') ? settingItems('window-aberration') : []] },
    ]),
    subpage(phosphor, 'filters', 'section-desktop', SCREEN_EFFECTS, [
      card('desktop-crt', 'crt-scanlines', 'crt-line-count', 'crt-line-thickness', 'crt-curvature', 'crt-mask', 'crt-mask-type', 'crt-flicker', 'crt-flicker-strength'),
      card('vhs', 'vhs-strength', 'glitch-bursts', 'glitch-gap'),
      card('chromatic-aberration', 'screen-grain', 'screen-grain-moving', 'screen-vignette', 'pixelate', 'stylize', 'posterize-levels', 'halftone-size'),
      ...filtersPlace(phosphor),
    ]),
    subpage(phosphor, 'color', 'section-color', COLOR_EFFECTS, [
      card('grade', 'grade-strength', 'grade-temperature', 'grade-tint', 'grade-saturation', 'grade-contrast', 'grade-brightness', 'duotone-dark', 'duotone-light'),
      card('palette', 'palette-dither'),
      card('bloom', 'bloom-radius', 'bloom-threshold'),
      card('invert', 'shadow-boost'),
      ...filtersPlace(phosphor),
    ]),
    subpage(phosphor, 'surfaces', 'section-surfaces', SURFACES, [card('surface-lines', 'surface-places', 'surface-color', 'app-lines')]),
  ];
}

export function describePage(phosphor: Extension<Granted>, rules: AppRules, looks: Looks): void {
  const { settingsPage, screenEffects } = phosphor;
  settingsPage.describe((): PageSection[] => [
    offSection(phosphor),
    lookSection(phosphor, looks),
    { items: subpages(phosphor, rules) },
  ]);
  screenEffects.onOffChanged(() => settingsPage.refresh());
}
