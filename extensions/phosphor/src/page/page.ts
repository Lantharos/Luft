import type { Extension, PageGroupItem, PageSection } from '@luft/extension-api';

import type { Looks } from '../looks/looks.js';
import type { AppRules, Granted } from '../rules.js';
import { lookSection } from './looks.js';
import { ruleItems } from './rules.js';

const settingItems = (...keys: string[]): PageGroupItem[] => keys.map(setting => ({ setting }));

function offSection(phosphor: Extension<Granted>): PageSection {
  const { t, screenEffects } = phosphor;
  const shortcut = screenEffects.shortcut;
  return {
    title: t('safety'),
    description: t('safety-detail'),
    items: [
      { type: 'row', title: t('safety-shortcut'), value: shortcut ?? t('safety-no-shortcut') },
      ...screenEffects.off ? [{ type: 'button' as const, title: t('safety-off'), label: t('safety-turn-on'), onActivate: () => screenEffects.turnBackOn() }] : [],
    ],
  };
}

function windowSections({ t }: Extension<Granted>): PageSection[] {
  return [
    {
      title: t('section-windows'),
      items: [
        ...settingItems('border', 'border-color', 'border-app-color', 'border-second-color', 'border-width', 'border-glow-size', 'border-motion', 'border-speed', 'border-focused'),
        ...settingItems('overlay', 'overlay-strength', 'overlay-tint-color', 'overlay-line-spacing', 'overlay-grain-size', 'overlay-vignette-size'),
        ...settingItems('shadow', 'shadow-color', 'shadow-size', 'unfocused', 'unfocused-strength', 'window-crt', 'window-aberration', 'windows-fullscreen'),
      ],
    },
    { title: t('section-motion'), items: settingItems('open-effect', 'open-length', 'close-effect', 'close-length') },
  ];
}

function screenSections({ t }: Extension<Granted>): PageSection[] {
  return [
    {
      title: t('section-desktop'),
      description: t('section-desktop-detail'),
      items: [
        { setting: 'desktop-crt' },
        {
          type: 'group', title: t('crt-details'),
          items: settingItems('crt-scanlines', 'crt-line-count', 'crt-line-thickness', 'crt-curvature', 'crt-mask', 'crt-mask-type', 'crt-flicker', 'crt-flicker-strength'),
        },
        ...settingItems('vhs', 'vhs-strength', 'glitch-bursts', 'glitch-gap', 'bloom', 'bloom-radius', 'bloom-threshold', 'chromatic-aberration', 'screen-grain', 'screen-grain-moving', 'screen-vignette'),
      ],
    },
    {
      title: t('section-color'),
      items: [
        ...settingItems('grade', 'grade-strength'),
        { type: 'group', title: t('grade-adjust'), items: settingItems('grade-temperature', 'grade-tint', 'grade-saturation', 'grade-contrast', 'grade-brightness') },
        ...settingItems('duotone-dark', 'duotone-light', 'palette', 'palette-dither', 'pixelate', 'stylize', 'posterize-levels', 'halftone-size', 'invert', 'shadow-boost'),
      ],
    },
    { title: t('section-filters-place'), items: settingItems('filters-scope', 'filters-fullscreen', 'filters-captured') },
  ];
}

export function describePage(phosphor: Extension<Granted>, rules: AppRules, looks: Looks): void {
  const { t, settingsPage, screenEffects } = phosphor;
  settingsPage.describe((): PageSection[] => [
    offSection(phosphor),
    lookSection(phosphor, looks),
    ...windowSections(phosphor),
    { title: t('section-rules'), description: t('section-rules-detail'), items: ruleItems(phosphor, rules) },
    ...screenSections(phosphor),
    {
      title: t('section-surfaces'),
      description: t('section-surfaces-detail'),
      items: settingItems('surface-lines', 'surface-places', 'surface-color', 'app-lines'),
    },
  ]);
  screenEffects.onOffChanged(() => settingsPage.refresh());
}
