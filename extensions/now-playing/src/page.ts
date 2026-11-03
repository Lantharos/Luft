import type { Extension, PageSection } from '@luft/extension-api';

import type { Following } from './following.js';

type Granted = 'taskbar' | 'media' | 'popups';

export function describePage(extension: Extension<Granted>, following: Following): void {
  const { t } = extension;
  extension.settingsPage.describe((): PageSection[] => {
    const ignored = following.ignored;
    const seen = following.seen;
    return [
      { items: [{ setting: 'show' }, { setting: 'controls' }, { setting: 'hide-paused' }] },
      {
        title: t('players'),
        description: t('players-description'),
        items: seen.length
          ? seen.map(name => ({ type: 'switch' as const, title: name, checked: !ignored.includes(name), onToggled: (on: boolean) => following.setIgnored(name, !on) }))
          : [{ type: 'text' as const, text: t('no-players') }],
      },
    ];
  });
}
