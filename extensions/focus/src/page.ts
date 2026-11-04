import type { Extension } from '@luft/extension-api';

import { type Granted, SOUNDSCAPES } from './session.js';

export function describePage(extension: Extension<Granted>): void {
  const { t } = extension;
  extension.settingsPage.describe(() => [
    {
      title: t('session'),
      items: [{ setting: 'length' }, { setting: 'hold-notifications' }, ...extension.peers.handles(SOUNDSCAPES, 'play') ? [{ setting: 'soundscapes' }] : []],
    },
    { title: t('taskbar'), items: [{ type: 'taskbar-place', element: 'focus' }] },
  ]);
  extension.peers.onChanged(() => extension.settingsPage.refresh());
}
