import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from '../../main.js';
import { NoGrabPopup } from './popups.js';

export interface KeyOptions {
  label?: string;
  iconName?: string;
  commitString?: string;
  keyval?: number;
  hasAction?: boolean;
}

const extendedKeyButtons = new WeakSet<Clutter.Actor>();

export function isExtendedKey(actor: Clutter.Actor): boolean {
  return extendedKeyButtons.has(actor);
}

export namespace Key {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'long-press': () => void;
    'released': () => void;
    'keyval': (keyval: number) => void;
    'commit': (text: string) => void;
  }
}

export const Key = GObject.registerClass({
  Signals: {
    'long-press': {},
    'released': {},
    'keyval': { param_types: [GObject.TYPE_UINT] },
    'commit': { param_types: [GObject.TYPE_STRING] },
  },
}, class Key extends St.BoxLayout {
  declare connect: GObject.SignalMethods<this, Key.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, Key.Signals>['emit'];

  readonly keyButton: St.Button;
  private readonly keyval: number;
  private readonly hasAction: boolean;
  private iconActor: St.Icon | null = null;
  private subkeysMenu: NoGrabPopup | null = null;

  constructor({ label, iconName, commitString, keyval = 0, hasAction = false }: KeyOptions, readonly extendedKeys: string[] = []) {
    super({ style_class: 'key-container' });

    this.keyval = keyval;
    this.hasAction = hasAction;
    this.keyButton = this.makeKey(commitString, label, iconName);
    this.add_child(this.keyButton);
    this.connect('destroy', () => {
      this.subkeysMenu?.destroy();
      this.subkeysMenu = null;
    });
  }

  setIconName(iconName: string): void {
    this.iconActor!.icon_name = iconName;
  }

  showSubkeys(): void {
    this.subkeys().open();
  }

  hideSubkeys(): void {
    this.subkeysMenu?.close();
  }

  setLatched(latched: boolean): void {
    if (latched) this.keyButton.add_style_pseudo_class('latched');
    else this.keyButton.remove_style_pseudo_class('latched');
  }

  private subkeys(): NoGrabPopup {
    if (this.subkeysMenu) return this.subkeysMenu;

    const menu = new NoGrabPopup(this.keyButton, St.Side.BOTTOM);
    menu.actor.add_style_class_name('keyboard-subkeys-boxpointer');
    menu.box.orientation = Clutter.Orientation.HORIZONTAL;
    menu.box.style_class = 'key-container';

    for (const extendedKey of this.extendedKeys) {
      const key = this.makeKey(extendedKey);
      extendedKeyButtons.add(key);
      menu.box.add_child(key);
      key.set_size(...this.keyButton.allocation.get_size());
    }

    Main.layoutManager.addKeyboardChrome(menu.actor);
    this.subkeysMenu = menu;
    return menu;
  }

  private makeKey(commitString?: string, label?: string, icon?: string): St.Button {
    const button = new St.Button({ style_class: 'keyboard-key', x_expand: true });

    if (icon) {
      this.iconActor = new St.Icon({ icon_name: icon });
      button.set_child(this.iconActor);
    } else if (label) {
      button.set_label(label);
    } else if (commitString) {
      button.set_label(commitString);
    }

    const longPressGesture = new Clutter.LongPressGesture();
    longPressGesture.connect('recognize', () => {
      this.emit('long-press');
      if (this.extendedKeys.length > 0) this.showSubkeys();
    });
    button.add_action(longPressGesture);

    button.connect('clicked', () => {
      if (this.keyval && button === this.keyButton) this.emit('keyval', this.keyval);
      else if (commitString) this.emit('commit', commitString);
      else if (!this.hasAction) console.error('Need keyval, commitString or an action');

      this.emit('released');
      this.hideSubkeys();
    });

    return button;
  }
});

export type Key = InstanceType<typeof Key>;
