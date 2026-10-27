import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type Shell from 'gi://Shell';

import * as Dialog from '../../shared/dialogs/dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from '../../shared/dialogs/modalDialog.js';

const ONE_SECOND = 1000;

export class DisplayChangeDialog extends ModalDialog {
  static {
    GObject.registerClass(this);
  }

  private countDown = global.backend.get_monitor_manager().get_display_configuration_timeout();
  private readonly message = new Dialog.MessageDialogContent({
    title: KestrelUi.t('display-change-title'),
    description: this.formatCountDown(),
    iconName: 'video-display-symbolic',
  });

  private timeoutId: number;

  constructor(private readonly wm: Shell.WM) {
    super();

    this.contentLayout.add_child(this.message);

    this.addButton({
      label: KestrelUi.t('display-change-revert'),
      action: () => this.complete(false),
      key: Clutter.KEY_Escape,
    });
    this.addButton({
      label: KestrelUi.t('display-change-keep'),
      action: () => this.complete(true),
      default: true,
    });

    this.timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, ONE_SECOND, () => this.tick());
    GLib.Source.set_name_by_id(this.timeoutId, '[kestrel] this._tick');
  }

  close(): void {
    if (this.timeoutId > 0) {
      GLib.source_remove(this.timeoutId);
      this.timeoutId = 0;
    }

    super.close();
  }

  private formatCountDown(): string {
    return KestrelUi.t('display-change-countdown', { seconds: this.countDown });
  }

  private tick(): boolean {
    this.countDown--;

    if (this.countDown === 0) {
      this.timeoutId = 0;
      this.close();
      return GLib.SOURCE_REMOVE;
    }

    this.message.description = this.formatCountDown();
    return GLib.SOURCE_CONTINUE;
  }

  private complete(ok: boolean): void {
    this.wm.complete_display_change(ok);
    this.close();
  }
}
