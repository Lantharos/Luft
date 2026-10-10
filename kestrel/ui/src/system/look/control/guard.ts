import type Shell from 'gi://Shell';

import type { Context } from '../../../context.js';
import { LookError } from '../errors.js';

export type Screen = Pick<Context, 'sessionMode' | 'screenShield' | 'canInteract'>;

export function screenGuarded(screen: Screen): boolean {
  const stage = (global as unknown as Shell.Global).stage;
  return screen.sessionMode.isLocked || !!screen.screenShield?.active || !screen.canInteract() || stage.get_grab_actor() !== null;
}

export function requireOpenScreen(screen: Screen): void {
  if (screenGuarded(screen))
    throw new LookError('Busy', 'The screen is locked, or a prompt or menu is open on it. Try again once it is gone.');
}
