import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Meta from 'gi://Meta';

import * as Dialog from './dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import * as ModalDialog from './modalDialog.js';

const KEYBOARD_A11Y_SCHEMA    = 'org.gnome.desktop.a11y.keyboard';
const KEY_STICKY_KEYS_ENABLED = 'stickykeys-enable';
const KEY_SLOW_KEYS_ENABLED   = 'slowkeys-enable';

export const KbdA11yDialog = GObject.registerClass(
class KbdA11yDialog extends GObject.Object {
    _init() {
        super._init();

        this._a11ySettings = new Gio.Settings({schema_id: KEYBOARD_A11Y_SCHEMA});

        const seat = global.stage.context.get_backend().get_default_seat();
        seat.connect('kbd-a11y-flags-changed',
            this._showKbdA11yDialog.bind(this));
    }

    _showKbdA11yDialog(seat, newFlags, whatChanged) {
        const dialog = new ModalDialog.ModalDialog();
        let title, description;
        let key, enabled;

        if (whatChanged & Meta.KeyboardA11yFlags.SLOW_KEYS_ENABLED) {
            key = KEY_SLOW_KEYS_ENABLED;
            enabled = (newFlags & Meta.KeyboardA11yFlags.SLOW_KEYS_ENABLED) > 0;
            title = KestrelUi.t(enabled ? 'kbd-a11y-slow-keys-on' : 'kbd-a11y-slow-keys-off');
            description = KestrelUi.t('kbd-a11y-slow-keys-description');
        } else if (whatChanged & Meta.KeyboardA11yFlags.STICKY_KEYS_ENABLED) {
            key = KEY_STICKY_KEYS_ENABLED;
            enabled = (newFlags & Meta.KeyboardA11yFlags.STICKY_KEYS_ENABLED) > 0;
            title = KestrelUi.t(enabled ? 'kbd-a11y-sticky-keys-on' : 'kbd-a11y-sticky-keys-off');
            description = KestrelUi.t(enabled
                ? 'kbd-a11y-sticky-keys-on-description'
                : 'kbd-a11y-sticky-keys-off-description');
        } else {
            return;
        }

        const content = new Dialog.MessageDialogContent({
            title,
            description,
            iconName: 'preferences-desktop-accessibility-symbolic',
        });
        dialog.contentLayout.add_child(content);

        dialog.addButton({
            label: KestrelUi.t(enabled ? 'kbd-a11y-leave-on' : 'kbd-a11y-turn-on'),
            action: () => {
                this._a11ySettings.set_boolean(key, true);
                dialog.close();
            },
            default: enabled,
            key: !enabled ? Clutter.KEY_Escape : null,
        });

        dialog.addButton({
            label: KestrelUi.t(enabled ? 'kbd-a11y-turn-off' : 'kbd-a11y-leave-off'),
            action: () => {
                this._a11ySettings.set_boolean(key, false);
                dialog.close();
            },
            default: !enabled,
            key: enabled ? Clutter.KEY_Escape : null,
        });

        dialog.open();
    }
});
