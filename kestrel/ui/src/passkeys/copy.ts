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

function subject(app: string | null): string {
  return app ?? 'An app';
}

export function copyFor({ purpose, site, app, accounts }: Request): Copy {
  const account = accounts[0];
  switch (purpose) {
    case 'register':
      return {
        title: `Create a passkey for ${site}?`,
        description: account ? `${subject(app)} wants to save a passkey for ${account.name || account.displayName}. It stays on this computer.` : `${subject(app)} wants to save a passkey. It stays on this computer.`,
        icon: 'dialog-password-symbolic',
      };
    case 'sign-in':
      return {
        title: `Sign in to ${site} with your passkey?`,
        description: accounts.length > 1 ? `${subject(app)} is asking for a passkey. Choose the account to sign in with.` : `${subject(app)} is asking for your passkey.`,
        icon: 'dialog-password-symbolic',
      };
    case 'manage':
      return {
        title: `Let ${app ?? 'this app'} manage your passkeys?`,
        description: 'It will see which sites you have passkeys for and can remove them.',
        icon: 'dialog-password-symbolic',
      };
    case 'registered':
      return {
        title: `You already have a passkey for ${site}`,
        description: 'Sign in with the one you have instead.',
        icon: 'dialog-password-symbolic',
      };
    case 'choose':
      return {
        title: 'Use the passkeys on this computer?',
        description: `${subject(app)} is asking where your passkey is.`,
        icon: 'computer-symbolic',
      };
  }
}

export function needsVerification(purpose: Purpose): boolean {
  return purpose === 'register' || purpose === 'sign-in' || purpose === 'manage';
}
