import type { Extension, PageSection } from '@luft/extension-api';

import type { Following } from './following.js';

type Granted = 'taskbar' | 'media' | 'popups';

export function describePage(extension: Extension<Granted>, following: Following): void {
  const { t } = extension;
  extension.settingsPage.describe((): PageSection[] => {
    const ignored = following.ignored;
    const seen = following.seen;
    return [
      {
        title: t('look'),
        items: [{ setting: 'layout' }, { setting: 'second-line' }, { setting: 'title-width' }, { setting: 'hide-paused' }, { setting: 'expand-on-hover' }, { type: 'taskbar-place', element: 'now-playing' }],
      },
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
