import type { Extension, PageItem, PageSection } from '@luft/extension-api';

import type { Playground } from './playground/playground.js';

const CELL = 96;
const COLUMNS = 8;
const RATE = 6;

const row = (index: number) => Array.from({ length: COLUMNS }, (_, frame) => index * COLUMNS + frame);

/** The Settings page of Playthings: a moving picture of each kind, its choices, and arranging them by hand. */
export function describePage(extension: Extension, playground: Playground, arrange: () => void): void {
  const { t, settings } = extension;

  const kind = (setting: string, title: string, description: string, preview: number, rows: PageItem[]): PageSection => ({
    items: [
      {
        type: 'sprite', title, description, image: 'sheets/preview.png', cell: CELL, columns: COLUMNS, frames: row(preview), rate: RATE,
        checked: settings.get<boolean>(setting), onToggled: on => settings.set(setting, on),
      },
      ...rows,
    ],
  });

  extension.settingsPage.describe(() => [
    kind('lanterns', t('lanterns'), t('lanterns-detail'), 0, [{ setting: 'lantern-count' }, { setting: 'lantern-place' }, { setting: 'lantern-paper' }]),
    kind('clouds', t('clouds'), t('clouds-detail'), 1, [{ setting: 'cloud-count' }, { setting: 'cloud-place' }]),
    kind('campfire', t('campfire'), t('campfire-detail'), 2, [{ setting: 'campfire-count' }, { setting: 'campfire-place' }]),
    kind('stars', t('stars'), t('stars-detail'), 3, [{ setting: 'star-count' }, { setting: 'star-place' }]),
    {
      title: t('everywhere'),
      items: [
        { setting: 'size' },
        { setting: 'displays' },
        { setting: 'ambient' },
        { type: 'button', title: t('arrange'), description: t('arrange-detail'), label: t('arrange-button'), onActivate: arrange },
        { type: 'button', title: t('arrange-reset'), description: t('reset-detail'), label: t('reset-button'), onActivate: () => playground.resetPlaces() },
      ],
    },
  ]);
}
