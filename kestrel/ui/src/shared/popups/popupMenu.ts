import { freezeSelection } from '../../appearance/kestrelGlass.js';
import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { BoxPointer, PopupAnimation } from './boxpointer.js';
import * as Main from '../../core/main.js';
import { PopupMenuBase, type MenuCloseParams, type MenuOpenParams } from './menu/menuBase.js';

export { arrowIcon, Ornament, PopupBaseMenuItem, PopupImageMenuItem, PopupMenuItem, PopupSeparatorMenuItem } from './menu/items.js';
export type { PopupBaseMenuItemOptions } from './menu/items.js';
export { PopupMenuBase, PopupMenuSection, PopupSubMenu, PopupSubMenuMenuItem } from './menu/menuBase.js';
export type { MenuCloseParams, MenuItem, MenuOpenParams } from './menu/menuBase.js';
export { PopupMenuManager } from './menu/manager.js';
export { Switch } from './menu/switch.js';

const NAV_KEYS: Record<St.Side, number> = {
  [St.Side.TOP]: Clutter.KEY_Down,
  [St.Side.BOTTOM]: Clutter.KEY_Up,
  [St.Side.LEFT]: Clutter.KEY_Right,
  [St.Side.RIGHT]: Clutter.KEY_Left,
};

function popupAnimation({ animate = true, fadeOnly = false }: MenuCloseParams = {}): number {
  if (!animate) return PopupAnimation.NONE;
  return fadeOnly ? PopupAnimation.FADE : PopupAnimation.FULL;
}

export class PopupMenu extends PopupMenuBase {
  declare actor: BoxPointer;
  private readonly keyController = new Clutter.KeyController();
  private systemModalOpenedId = 0;

  constructor(sourceActor: Clutter.Actor | null, private readonly arrowAlignment: number, arrowSide: St.Side) {
    super(sourceActor, 'popup-menu-content');

    this.actor = new BoxPointer(arrowSide);
    (this.actor as BoxPointer & { _delegate: PopupMenu })._delegate = this;
    this.actor.style_class = 'popup-menu-boxpointer';

    this.actor.bin.set_child(this.box);
    this.actor.add_style_class_name('popup-menu');
    this.actor.set_keynav_flags(St.KeynavFlags.WRAP_VERTICALLY);

    global.focus_manager.add_group(this.actor);
    this.actor.reactive = true;

    this.keyController.connect('key-press', () => this.onKeyPress());

    if (sourceActor) {
      sourceActor.connectObject('notify::mapped', () => {
        if (!sourceActor.mapped) this.close();
      }, this);
      sourceActor.add_action(this.keyController);
    }
  }

  private onKeyPress(): boolean {
    if (!this.sourceActor!.reactive) return Clutter.EVENT_PROPAGATE;

    const navKey = NAV_KEYS[this.actor.arrowSide];
    const [, symbol] = this.keyController.get_key();
    const [, pressed, latched] = this.keyController.get_state();

    if (pressed || latched) return Clutter.EVENT_PROPAGATE;

    if (symbol === Clutter.KEY_space || symbol === Clutter.KEY_Return) {
      this.toggle();
      return Clutter.EVENT_STOP;
    }
    if (symbol === navKey) {
      if (!this.isOpen) this.toggle();
      this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      return Clutter.EVENT_STOP;
    }
    return Clutter.EVENT_PROPAGATE;
  }

  setSourceAlignment(alignment: number): void {
    this.actor.setSourceAlignment(alignment);
  }

  open(params: MenuOpenParams = {}): boolean {
    if (!super.open(params)) return false;

    if (!this.systemModalOpenedId)
      this.systemModalOpenedId = Main.layoutManager.connect('system-modal-opened', () => this.close());

    this.actor.setPosition(this.sourceActor, this.arrowAlignment);
    this.actor.open(popupAnimation(params));

    this.actor.get_parent()!.set_child_above_sibling(this.actor, null);

    if (!this.sourceActor?.has_allocation()) this.sourceActor?.get_parent()!.queue_relayout();

    return true;
  }

  close(params?: MenuCloseParams): boolean {
    this.actor.clearClosingSelection ??= freezeSelection(this.box);
    if (this.activeMenuItem) this.activeMenuItem.active = false;

    if (this.actor.visible) this.actor.close(popupAnimation(params), () => this.emit('menu-closed'));

    return super.close(params);
  }

  destroy(): void {
    this.sourceActor?.disconnectObject(this);

    if (this.systemModalOpenedId) Main.layoutManager.disconnect(this.systemModalOpenedId);
    this.systemModalOpenedId = 0;

    super.destroy();
  }
}
