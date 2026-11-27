import St from 'gi://St';

import type { ContextMenus } from '../../desktop/menus/contextMenus.js';
import { localized, t } from '../../shared/i18n/index.js';
import { pressable } from '../../shared/motion/motion.js';
import type { Printing } from './printing.js';

const ICON_SIZE = 16;

export class PrintIndicator {
  readonly actor: St.Button;
  private readonly stopWatching: () => void;

  constructor(private readonly printing: Printing, menus: ContextMenus) {
    const icon = new St.Icon({ icon_name: 'printer-symbolic', icon_size: ICON_SIZE });
    this.actor = new St.Button({
      name: 'kestrel-taskbar-printing', style_class: 'kestrel-status-button kestrel-panel-status kestrel-status-extra', child: icon,
      can_focus: true, track_hover: true,
    });
    localized(this.actor, () => (this.actor.accessible_name = t('printing')));
    this.actor.connect('clicked', () => printing.reopen());
    pressable(this.actor, icon);
    menus.bind(this.actor, () => [{ label: t('printing-settings'), run: () => menus.settings('printers') }]);
    this.stopWatching = printing.onChanged(() => this.sync());
    this.actor.connect('destroy', () => this.stopWatching());
    this.sync();
  }

  private sync(): void {
    this.actor.visible = this.printing.busy;
  }
}
