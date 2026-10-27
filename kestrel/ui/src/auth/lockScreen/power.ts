import * as SystemActions from '../../session/actions/systemActions.js';

import type { MenuEntry } from '../../desktop/menus/contextMenus.js';
import { t } from '../../shared/i18n/index.js';

export class LockPower {
  private readonly actions = SystemActions.getDefault();

  entries(): MenuEntry[] {
    const { actions } = this;
    return [
      { label: t('lock-screen-suspend'), available: actions.canSuspend, run: () => actions.activateSuspend() },
      { label: t('lock-screen-restart'), available: actions.canRestart, run: () => actions.activateRestart() },
      { label: t('lock-screen-power-off'), available: actions.canPowerOff, run: () => actions.activatePowerOff() },
    ].filter(entry => entry.available).map(({ label, run }) => ({ label, run }));
  }
}
