import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from './dialog.js';
import * as ModalDialog from './modalDialog.js';

import * as Main from './main.js';
import * as Util from '../misc/util.js';

const AudioDeviceSelectionDialog = GObject.registerClass({
    Signals: {'device-selected': {param_types: [GObject.TYPE_UINT]}},
}, class AudioDeviceSelectionDialog extends ModalDialog.ModalDialog {
    _init(devices) {
        super._init({styleClass: 'audio-device-selection-dialog'});

        this._deviceItems = {};

        this._buildLayout();

        if (devices & Shell.MixerHeadset.HEADPHONES)
            this._addDevice(Shell.MixerHeadset.HEADPHONES);
        if (devices & Shell.MixerHeadset.HEADSET)
            this._addDevice(Shell.MixerHeadset.HEADSET);
        if (devices & Shell.MixerHeadset.MICROPHONE)
            this._addDevice(Shell.MixerHeadset.MICROPHONE);
    }

    _buildLayout() {
        const content = new Dialog.MessageDialogContent({
            title: _('Select Audio Device'),
            iconName: 'audio-headphones-symbolic',
        });

        this._selectionBox = new St.BoxLayout({
            style_class: 'audio-selection-box',
            orientation: Clutter.Orientation.VERTICAL,
            x_expand: true,
        });
        content.add_child(this._selectionBox);

        this.contentLayout.add_child(content);

        this.addButton({
            action: () => this.close(),
            label: _('Cancel'),
            key: Clutter.KEY_Escape,
        });

        if (Main.sessionMode.allowSettings) {
            this.addButton({
                action: this._openSettings.bind(this),
                label: _('Sound Settings'),
            });
        }
    }

    _getDeviceLabel(device) {
        switch (device) {
        case Shell.MixerHeadset.HEADPHONES:
            return _('Headphones');
        case Shell.MixerHeadset.HEADSET:
            return _('Headset');
        case Shell.MixerHeadset.MICROPHONE:
            return _('Microphone');
        default:
            return null;
        }
    }

    _getDeviceIcon(device) {
        switch (device) {
        case Shell.MixerHeadset.HEADPHONES:
            return 'audio-headphones-symbolic';
        case Shell.MixerHeadset.HEADSET:
            return 'audio-headset-symbolic';
        case Shell.MixerHeadset.MICROPHONE:
            return 'audio-input-microphone-symbolic';
        default:
            return null;
        }
    }

    _addDevice(device) {
        const box = new St.BoxLayout({
            style_class: 'audio-selection-device-box',
            x_expand: true,
        });
        const icon = new St.Icon({
            style_class: 'audio-selection-device-icon',
            icon_name: this._getDeviceIcon(device),
        });
        box.add_child(icon);

        const label = new St.Label({
            style_class: 'audio-selection-device-label',
            text: this._getDeviceLabel(device),
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        box.add_child(label);

        const button = new St.Button({
            style_class: 'audio-selection-device',
            can_focus: true,
            x_expand: true,
            child: box,
        });
        this._selectionBox.add_child(button);

        button.connect('clicked', () => {
            this.emit('device-selected', device);
            this.close();
        });
    }

    _openSettings() {
        this.close();
        Util.openSettings('sound');
    }
});

/**
 * @param {number} devices - the Shell.MixerHeadset choices to offer
 * @param {(device: number) => void} selected - called with the chosen device
 * @returns {ModalDialog.ModalDialog | null} the open dialog, unless there was nothing to choose
 */
export function askForAudioDevice(devices, selected) {
    if ([Shell.MixerHeadset.HEADPHONES, Shell.MixerHeadset.HEADSET, Shell.MixerHeadset.MICROPHONE].filter(device => devices & device).length < 2)
        return null;

    const dialog = new AudioDeviceSelectionDialog(devices);
    dialog.connect('device-selected', (_dialog, device) => selected(device));
    dialog.open();
    return dialog;
}
