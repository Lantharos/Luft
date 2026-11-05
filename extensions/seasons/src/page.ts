import type { Extension } from '@luft/extension-api';

import { customSections } from './custom/page.js';
import type { Presets } from './custom/presets.js';

/** Seasons' own page in Settings: what falls and how, and the sets of pictures people made. */
export function describePage(seasons: Extension, presets: Presets, show: () => void): void {
  const { t } = seasons;
  seasons.settingsPage.describe(() => [
    { title: t('look'), items: [{ setting: 'effect' }, { setting: 'intensity' }, { setting: 'color' }, { setting: 'visible' }, { setting: 'part' }] },
    { title: t('sound'), items: [{ setting: 'sound' }, { setting: 'volume' }] },
    ...customSections(seasons, presets, show),
  ]);
  presets.watch(() => seasons.settingsPage.refresh());
}
