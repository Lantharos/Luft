import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { SwitcherList, SwitcherPopup } from '../../switchers/switcherPopup.js';
import type { InputSource } from './inputSource.js';

const InputSourceSwitcher = GObject.registerClass(class InputSourceSwitcher extends SwitcherList {
  constructor(items: InputSource[]) {
    super(false);
    for (const item of items) this.addIcon(item);
  }

  private addIcon(item: InputSource): void {
    const box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL });
    box.add_child(new St.Bin({
      style_class: 'input-source-switcher-symbol',
      child: new St.Label({ text: item.shortName, x_align: Clutter.ActorAlign.CENTER, y_align: Clutter.ActorAlign.CENTER }),
    }));
    const text = new St.Label({ style_class: 'input-source-switcher-name', text: item.displayName, x_align: Clutter.ActorAlign.CENTER });
    text.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
    box.add_child(text);
    this.addItem(box, text);
  }
});

interface InputSourcePopupOptions {
  items: InputSource[];
  action: number;
  actionBackward: number;
}

export const InputSourcePopup = GObject.registerClass(class InputSourcePopup extends SwitcherPopup {
  private readonly action: number;
  private readonly actionBackward: number;

  constructor({ items, action, actionBackward }: InputSourcePopupOptions) {
    super(items);
    this.action = action;
    this.actionBackward = actionBackward;
    this._switcherList = new InputSourceSwitcher(items);
  }

  _keyPressHandler(keysym: number, action: number): boolean {
    if (action === this.action) this._select(this._next());
    else if (action === this.actionBackward) this._select(this._previous());
    else if (keysym === Clutter.KEY_Left) this._select(this._previous());
    else if (keysym === Clutter.KEY_Right) this._select(this._next());
    else return Clutter.EVENT_PROPAGATE;
    return Clutter.EVENT_STOP;
  }

  _finish(): void {
    super._finish();
    this._items[this._selectedIndex].activate(true);
  }
});
export type InputSourcePopup = InstanceType<typeof InputSourcePopup>;
