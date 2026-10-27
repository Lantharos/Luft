import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Dialog from './dialog.js';
import * as KestrelUi from '../../kestrelUi.js';
import { ModalDialog } from './modalDialog.js';

import * as Main from '../main.js';
import * as Util from '../runtime/util.js';

const DEVICES = [Shell.MixerHeadset.HEADPHONES, Shell.MixerHeadset.HEADSET, Shell.MixerHeadset.MICROPHONE];

const DEVICE_LABELS = {
  [Shell.MixerHeadset.HEADPHONES]: 'audio-device-headphones',
  [Shell.MixerHeadset.HEADSET]: 'audio-device-headset',
  [Shell.MixerHeadset.MICROPHONE]: 'audio-device-microphone',
};

const DEVICE_ICONS = {
  [Shell.MixerHeadset.HEADPHONES]: 'audio-headphones-symbolic',
  [Shell.MixerHeadset.HEADSET]: 'audio-headset-symbolic',
  [Shell.MixerHeadset.MICROPHONE]: 'audio-input-microphone-symbolic',
};

type Device = typeof DEVICES[number];

namespace AudioDeviceSelectionDialog {
  export interface Signals extends ModalDialog.Signals {
    'device-selected': (device: Device) => void;
  }
}

class AudioDeviceSelectionDialog extends ModalDialog {
  static [GObject.signals] = {
    'device-selected': { param_types: [GObject.TYPE_UINT] },
  };

  static {
    GObject.registerClass(this);
  }

  declare connect: GObject.SignalMethods<this, AudioDeviceSelectionDialog.Signals>['connect'];
  declare connect_after: GObject.SignalMethods<this, AudioDeviceSelectionDialog.Signals>['connect_after'];
  declare emit: GObject.SignalMethods<this, AudioDeviceSelectionDialog.Signals>['emit'];

  private readonly selectionBox = new St.BoxLayout({
    style_class: 'audio-selection-box',
    orientation: Clutter.Orientation.VERTICAL,
    x_expand: true,
  });

  constructor(devices: number) {
    super({ styleClass: 'audio-device-selection-dialog' });

    this.buildLayout();

    for (const device of DEVICES) {
      if (devices & device) this.addDevice(device);
    }
  }

  private buildLayout(): void {
    const content = new Dialog.MessageDialogContent({
      title: KestrelUi.t('audio-device-title'),
      iconName: 'audio-headphones-symbolic',
    });
    content.add_child(this.selectionBox);

    this.contentLayout.add_child(content);

    this.addButton({
      action: () => this.close(),
      label: KestrelUi.t('audio-device-cancel'),
      key: Clutter.KEY_Escape,
    });

    if (Main.sessionMode.allowSettings) {
      this.addButton({
        action: () => this.openSettings(),
        label: KestrelUi.t('audio-device-sound-settings'),
      });
    }
  }

  private addDevice(device: Device): void {
    const box = new St.BoxLayout({ style_class: 'audio-selection-device-box', x_expand: true });
    box.add_child(new St.Icon({ style_class: 'audio-selection-device-icon', icon_name: DEVICE_ICONS[device] }));
    box.add_child(new St.Label({
      style_class: 'audio-selection-device-label',
      text: KestrelUi.t(DEVICE_LABELS[device]),
      y_align: Clutter.ActorAlign.CENTER,
      x_expand: true,
    }));

    const button = new St.Button({
      style_class: 'audio-selection-device',
      can_focus: true,
      x_expand: true,
      child: box,
    });
    this.selectionBox.add_child(button);

    button.connect('clicked', () => {
      this.emit('device-selected', device);
      this.close();
    });
  }

  private openSettings(): void {
    this.close();
    Util.openSettings('sound');
  }
}

export function askForAudioDevice(devices: number, selected: (device: Device) => void): ModalDialog | null {
  if (DEVICES.filter(device => devices & device).length < 2) return null;

  const dialog = new AudioDeviceSelectionDialog(devices);
  dialog.connect('device-selected', (_dialog, device) => selected(device));
  dialog.open();
  return dialog;
}
