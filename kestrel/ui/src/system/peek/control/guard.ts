import { t } from '../../../shared/i18n/index.js';
import { PeekError } from '../errors.js';

export interface Screen {
  readonly sessionMode: { readonly isLocked: boolean };
  readonly screenShield: { readonly active: boolean } | null;
  canInteract(): boolean;
}

export function screenGuarded(screen: Screen): boolean {
  return screen.sessionMode.isLocked || !!screen.screenShield?.active || !screen.canInteract();
}

export function requireOpenScreen(screen: Screen): void {
  if (screenGuarded(screen))
    throw new PeekError('Busy', t('peek-error-screen-busy'));
}
