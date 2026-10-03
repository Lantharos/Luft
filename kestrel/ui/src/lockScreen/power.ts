import * as SystemActions from 'resource:///com/lantharos/kestrel/misc/systemActions.js';

import type { MenuEntry } from '../menus/contextMenus.js';

export class LockPower {
  private readonly actions = SystemActions.getDefault();

  entries(): MenuEntry[] {
    const { actions } = this;
    return [
      { label: 'Suspend', available: actions.canSuspend, run: () => actions.activateSuspend() },
      { label: 'Restart…', available: actions.canRestart, run: () => actions.activateRestart() },
      { label: 'Power off…', available: actions.canPowerOff, run: () => actions.activatePowerOff() },
    ].filter(entry => entry.available).map(({ label, run }) => ({ label, run }));
  }
}
