import type { Extension } from '@luft/extension-api';

import type { Ended, Granted } from './session.js';

/** A quiet note when a session ends: how long it lasted and what came in meanwhile, with a way to go again. */
export function sumUp(extension: Extension<Granted>, { minutes, held }: Ended, again: () => void): void {
  const { t } = extension;
  const count = held.reduce((sum, app) => sum + app.count, 0);
  const apps = new Intl.ListFormat(undefined, { type: 'conjunction' }).format(held.map(app => app.app));
  extension.notifications.send({
    title: t('done-title', { minutes }),
    body: count ? t('done-held', { count, apps }) : t('done-quiet'),
    icon: 'icons/focus-symbolic.svg',
    actions: [{ label: t('again'), onActivate: again }],
  });
}
