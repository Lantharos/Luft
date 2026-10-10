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
    throw new PeekError('Busy', 'The screen is locked, or a system prompt is open on it. Try again once it is gone.');
}
