import type { PageItem } from '@luft/extension-api';

import type { Pult } from './pult.js';

function account(pult: Pult): PageItem[] {
  const { t } = pult.extension;
  const { signIn, client } = pult;
  const account = client.account;
  if (client.signedIn && account) {
    return [{ type: 'button', title: t('signed-in-as', { name: account.name }), description: account.email, label: t('sign-out'), onActivate: () => pult.signOut() }];
  }
  if (signIn && 'code' in signIn) {
    return [
      { type: 'button', title: t('code', { code: signIn.code.userCode }), description: t('code.description'), label: t('cancel'), onActivate: () => pult.cancelSignIn() },
      { type: 'button', title: t('page-closed'), label: t('open-again'), onActivate: () => pult.reopenSignIn() },
    ];
  }
  const failed = signIn && 'failed' in signIn ? signIn.failed : null;
  const [title, description] = failed === 'unreachable'
    ? [t('not-connected'), t('not-connected.description')]
    : failed
      ? [t('sign-in-failed'), t('sign-in-failed.description')]
      : [t('signed-out'), t('signed-out.description')];
  return [{ type: 'button', title, description, label: t('sign-in'), onActivate: () => pult.beginSignIn() }];
}

export function describePage(pult: Pult): void {
  const { extension } = pult;
  const { t } = extension;
  extension.settingsPage.describe(() => [
    { title: t('account'), items: account(pult) },
    {
      title: t('showing'),
      items: [...pult.client.signedIn ? [{ setting: 'count' }, { setting: 'urgent' }] : [], { setting: 'hide-empty' }, { type: 'taskbar-place', element: 'pult' }],
    },
  ]);
  pult.onChanged(() => extension.settingsPage.refresh());
}
