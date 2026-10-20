import { type Args, t } from '../../shared/i18n/index.js';

export type Purpose = 'register' | 'sign-in' | 'manage' | 'registered' | 'choose';

export interface Account {
  readonly name: string;
  readonly displayName: string;
}

export interface Request {
  readonly purpose: Purpose;
  readonly site: string;
  readonly app: string | null;
  readonly accounts: Account[];
  readonly fingerprint: string | null;
}

export interface Copy {
  title: string;
  description: string;
  icon: string;
}

export function copyFor({ purpose, site, app, accounts }: Request): Copy {
  const account = accounts[0];
  const asked = (byApp: string, byUnknown: string, args: Args = {}) => app ? t(byApp, { ...args, app }) : t(byUnknown, args);
  switch (purpose) {
    case 'register':
      return {
        title: t('passkeys-register-title', { site }),
        description: account
          ? asked('passkeys-register-account-by-app', 'passkeys-register-account', { account: account.name || account.displayName })
          : asked('passkeys-register-by-app', 'passkeys-register'),
        icon: 'dialog-password-symbolic',
      };
    case 'sign-in':
      return {
        title: t('passkeys-sign-in-title', { site }),
        description: accounts.length > 1
          ? asked('passkeys-sign-in-choose-by-app', 'passkeys-sign-in-choose')
          : asked('passkeys-sign-in-by-app', 'passkeys-sign-in'),
        icon: 'dialog-password-symbolic',
      };
    case 'manage':
      return {
        title: asked('passkeys-manage-title-by-app', 'passkeys-manage-title'),
        description: t('passkeys-manage-description'),
        icon: 'dialog-password-symbolic',
      };
    case 'registered':
      return {
        title: t('passkeys-registered-title', { site }),
        description: t('passkeys-registered-description'),
        icon: 'dialog-password-symbolic',
      };
    case 'choose':
      return {
        title: t('passkeys-choose-title'),
        description: asked('passkeys-choose-by-app', 'passkeys-choose'),
        icon: 'computer-symbolic',
      };
  }
}

export function needsVerification(purpose: Purpose): boolean {
  return purpose === 'register' || purpose === 'sign-in' || purpose === 'manage';
}
