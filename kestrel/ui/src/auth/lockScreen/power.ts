import * as Main from '../../core/main.js';
import * as SystemActions from '../../session/actions/systemActions.js';

import type { MenuEntry } from '../../desktop/menus/contextMenus.js';
import { promptGate } from '../../shared/dialogs/promptGate.js';
import { t } from '../../shared/i18n/index.js';

export class LockPower {
  private readonly actions = SystemActions.getDefault();

  entries(): MenuEntry[] {
    const { actions } = this;
    const confirmed = (end: () => void) => () => {
      promptGate.invite(Main.endSessionDialog);
      end();
    };
    return [
      { label: t('lock-screen-suspend'), available: actions.canSuspend, run: () => actions.activateSuspend() },
      { label: t('lock-screen-restart'), available: actions.canRestart, run: confirmed(() => actions.activateRestart()) },
      { label: t('lock-screen-power-off'), available: actions.canPowerOff, run: confirmed(() => actions.activatePowerOff()) },
    ].filter(entry => entry.available).map(({ label, run }) => ({ label, run }));
  }
}
