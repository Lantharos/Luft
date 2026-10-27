import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';

import * as Dialog from './dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from './modalDialog.js';

const KEYBOARD_A11Y_SCHEMA = 'org.gnome.desktop.a11y.keyboard';
const KEY_STICKY_KEYS_ENABLED = 'stickykeys-enable';
const KEY_SLOW_KEYS_ENABLED = 'slowkeys-enable';

interface Prompt {
  key: string;
  enabled: boolean;
  title: string;
  description: string;
}

function promptFor(newFlags: number, whatChanged: number): Prompt | null {
  if (whatChanged & Meta.KeyboardA11yFlags.SLOW_KEYS_ENABLED) {
    const enabled = (newFlags & Meta.KeyboardA11yFlags.SLOW_KEYS_ENABLED) > 0;
    return {
      key: KEY_SLOW_KEYS_ENABLED,
      enabled,
      title: KestrelUi.t(enabled ? 'kbd-a11y-slow-keys-on' : 'kbd-a11y-slow-keys-off'),
      description: KestrelUi.t('kbd-a11y-slow-keys-description'),
    };
  }

  if (whatChanged & Meta.KeyboardA11yFlags.STICKY_KEYS_ENABLED) {
    const enabled = (newFlags & Meta.KeyboardA11yFlags.STICKY_KEYS_ENABLED) > 0;
    return {
      key: KEY_STICKY_KEYS_ENABLED,
      enabled,
      title: KestrelUi.t(enabled ? 'kbd-a11y-sticky-keys-on' : 'kbd-a11y-sticky-keys-off'),
      description: KestrelUi.t(enabled ? 'kbd-a11y-sticky-keys-on-description' : 'kbd-a11y-sticky-keys-off-description'),
    };
  }

  return null;
}

export class KbdA11yDialog {
  private readonly a11ySettings = new Gio.Settings({ schema_id: KEYBOARD_A11Y_SCHEMA });

  constructor() {
    const seat = global.stage.context.get_backend().get_default_seat();
    seat.connect('kbd-a11y-flags-changed', (_seat, newFlags, whatChanged) => this.show(newFlags, whatChanged));
  }

  private show(newFlags: number, whatChanged: number): void {
    const prompt = promptFor(newFlags, whatChanged);
    if (!prompt) return;

    const { key, enabled, title, description } = prompt;
    const dialog = new ModalDialog();
    dialog.contentLayout.add_child(new Dialog.MessageDialogContent({
      title,
      description,
      iconName: 'preferences-desktop-accessibility-symbolic',
    }));

    dialog.addButton({
      label: KestrelUi.t(enabled ? 'kbd-a11y-leave-on' : 'kbd-a11y-turn-on'),
      action: () => {
        this.a11ySettings.set_boolean(key, true);
        dialog.close();
      },
      default: enabled,
      key: enabled ? undefined : Clutter.KEY_Escape,
    });

    dialog.addButton({
      label: KestrelUi.t(enabled ? 'kbd-a11y-turn-off' : 'kbd-a11y-leave-off'),
      action: () => {
        this.a11ySettings.set_boolean(key, false);
        dialog.close();
      },
      default: !enabled,
      key: enabled ? Clutter.KEY_Escape : undefined,
    });

    dialog.open();
  }
}
