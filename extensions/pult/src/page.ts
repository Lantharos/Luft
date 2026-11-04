import type { PageItem } from '@luft/extension-api';

import type { Pult } from './pult.js';

function account(pult: Pult): PageItem[] {
  const { t } = pult.extension;
  const { signIn, client } = pult;
  const account = client.account;
  if (client.signedIn && account) {
    return [{ type: 'button', title: t('signed-in-as', { name: account.name }), description: account.email, label: t('sign-out'), onActivate: () => void pult.signOut() }];
  }
  if (signIn && 'code' in signIn) {
    return [
      { type: 'button', title: t('code', { code: signIn.code.userCode }), description: t('code.description'), label: t('cancel'), onActivate: () => pult.cancelSignIn() },
      { type: 'button', title: t('page-closed'), label: t('open-again'), onActivate: () => pult.reopenSignIn() },
    ];
  }
  const failed = !!signIn && 'failed' in signIn;
  return [{
    type: 'button',
    title: t(failed ? 'sign-in-failed' : 'signed-out'),
    description: t(failed ? 'sign-in-failed.description' : 'signed-out.description'),
    label: t('sign-in'),
    onActivate: () => void pult.beginSignIn(),
  }];
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
