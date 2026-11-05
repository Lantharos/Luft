import type { Extension, PageItem, PageSection } from '@luft/extension-api';

import { type AppRules, type Granted, type Part, PARTS } from './rules.js';

const PART_LABELS: Record<Part, string> = { border: 'border', overlay: 'overlay', crt: 'window-crt', aberration: 'window-aberration', motion: 'rule-motion' };

function appName(apps: { id: string; name: string }[], id: string): string {
  return apps.find(app => app.id === id)?.name ?? id;
}

function ruleItems(phosphor: Extension<Granted>, rules: AppRules): PageItem[] {
  const { t, screenEffects } = phosphor;
  const apps = screenEffects.apps();
  const free = apps.filter(app => !rules.apps.includes(app.id));
  return [
    ...PARTS.map((part): PageItem => ({
      type: 'switch', title: t(`everywhere-${part}`), checked: rules.onEverywhere(part),
      onToggled: checked => rules.setEverywhere(part, checked),
    })),
    {
      type: 'list',
      empty: t('rules-empty'),
      items: rules.apps.map(app => ({
        title: appName(apps, app),
        actions: [
          ...PARTS.map(part => ({
            label: t(rules.value(app, part) ? 'rule-on' : 'rule-off', { part: t(PART_LABELS[part]) }),
            onActivate: () => rules.toggle(app, part),
          })),
          { label: t('rule-remove'), danger: true, onActivate: () => rules.remove(app) },
        ],
      })),
    },
    {
      type: 'choice', title: t('rule-add'), value: '',
      options: [{ value: '', label: t('rule-add-pick') }, ...free.map(app => ({ value: app.id, label: app.name }))],
      onChanged: value => {
        if (value) rules.add(value);
      },
    },
  ];
}

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

export function describePage(phosphor: Extension<Granted>, rules: AppRules): void {
  const { t, settingsPage, screenEffects } = phosphor;
  settingsPage.describe((): PageSection[] => [
    offSection(phosphor),
    {
      title: t('section-windows'),
      items: [
        { setting: 'border' }, { setting: 'border-color' }, { setting: 'border-second-color' }, { setting: 'border-width' }, { setting: 'border-motion' }, { setting: 'border-focused' },
        { setting: 'overlay' }, { setting: 'overlay-strength' }, { setting: 'window-crt' }, { setting: 'window-aberration' },
        { setting: 'open-effect' }, { setting: 'close-effect' }, { setting: 'windows-fullscreen' },
      ],
    },
    { title: t('section-rules'), description: t('section-rules-detail'), items: ruleItems(phosphor, rules) },
    {
      title: t('section-desktop'),
      description: t('section-desktop-detail'),
      items: [
        { setting: 'desktop-crt' }, { setting: 'crt-scanlines' }, { setting: 'crt-curvature' }, { setting: 'crt-mask' }, { setting: 'crt-flicker' },
        { setting: 'invert' }, { setting: 'grade' }, { setting: 'grade-strength' }, { setting: 'shadow-boost' }, { setting: 'bloom' }, { setting: 'chromatic-aberration' },
        { setting: 'filters-fullscreen' }, { setting: 'filters-captured' },
      ],
    },
    {
      title: t('section-surfaces'),
      description: t('section-surfaces-detail'),
      items: [{ setting: 'surface-lines' }, { setting: 'surface-places' }, { setting: 'surface-color' }, { setting: 'app-lines' }],
    },
  ]);
  screenEffects.onOffChanged(() => settingsPage.refresh());
}
