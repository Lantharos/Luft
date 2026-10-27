import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import { SwitcherList } from '../../desktop/switchers/switcherList.js';
import { SwitcherPopup } from '../../desktop/switchers/switcherPopup.js';
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

export class InputSourcePopup extends SwitcherPopup<InputSource> {
  static {
    GObject.registerClass(this);
  }

  private readonly action: number;
  private readonly actionBackward: number;

  constructor({ items, action, actionBackward }: InputSourcePopupOptions) {
    super(items, new InputSourceSwitcher(items));
    this.action = action;
    this.actionBackward = actionBackward;
  }

  protected keyPressHandler(keysym: number, action: number): boolean {
    if (action === this.action) this.select(this.next());
    else if (action === this.actionBackward) this.select(this.previous());
    else if (keysym === Clutter.KEY_Left) this.select(this.previous());
    else if (keysym === Clutter.KEY_Right) this.select(this.next());
    else return Clutter.EVENT_PROPAGATE;
    return Clutter.EVENT_STOP;
  }

  protected finish(timestamp: number): void {
    super.finish(timestamp);
    this.items[this.selectedIndex].activate(true);
  }
}
