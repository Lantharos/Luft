import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';

import * as Main from '../../main.js';
import type { PopupMenuBase } from './menuBase.js';

export interface MenuGrabParams {
  actionMode?: Shell.ActionMode;
}

export class PopupMenuManager {
  activeMenu: PopupMenuBase | null = null;
  private readonly grabParams: Required<MenuGrabParams>;
  private readonly menus: PopupMenuBase[] = [];
  private readonly keyController = new Clutter.KeyController();
  private readonly clickGesture = new Clutter.ClickGesture({ recognize_on_press: true });
  private readonly motionController = new Clutter.MotionController();
  private grab: Clutter.Grab | null = null;
  private keyFocusId = 0;

  constructor({ actionMode = Shell.ActionMode.POPUP }: MenuGrabParams = {}) {
    this.grabParams = { actionMode };

    this.keyController.connect('key-press', () => this.keyPress(this.activeMenu!));

    this.clickGesture.connect('may-recognize', () => {
      const event = this.clickGesture.get_point_event(0);
      const targetActor = global.stage.get_event_actor(event);
      return !targetActor || !this.activeMenu!.actor.contains(targetActor);
    });
    this.clickGesture.connect('recognize', () => this.activeMenu!.close());

    this.motionController.connect('enter', (_controller, sprite) => this.checkHoveredMenu(sprite));
  }

  addMenu(menu: PopupMenuBase, position?: number): void {
    if (this.menus.includes(menu)) return;

    menu.connectObject(
      'open-state-changed', (_menu: PopupMenuBase, open: boolean) => this.onMenuOpenState(menu, open),
      'destroy', () => this.removeMenu(menu), this);

    if (position === undefined) this.menus.push(menu);
    else this.menus.splice(position, 0, menu);
  }

  removeMenu(menu: PopupMenuBase): void {
    if (menu === this.activeMenu) {
      Main.popModal(this.grab!);
      this.grab = null;
      this.detachControllers(menu);
      this.disconnectKeyFocus();
    }

    const position = this.menus.indexOf(menu);
    if (position === -1) return;

    menu.disconnectObject(this);
    menu.actor.disconnectObject(this);

    this.menus.splice(position, 1);
  }

  private detachControllers(menu: PopupMenuBase): void {
    menu.actor.remove_action(this.keyController);
    menu.actor.remove_action(this.clickGesture);
    menu.actor.remove_action(this.motionController);
  }

  private disconnectKeyFocus(): void {
    if (!this.keyFocusId) return;

    global.stage.disconnect(this.keyFocusId);
    this.keyFocusId = 0;
  }

  private onMenuOpenState(menu: PopupMenuBase, open: boolean): void {
    if (open && this.activeMenu === menu) return;

    if (open) {
      const oldMenu = this.activeMenu;
      const oldGrab = this.grab;
      this.grab = Main.pushModal(menu.actor, this.grabParams);
      this.activeMenu = menu;
      if (oldMenu) {
        this.detachControllers(oldMenu);
        oldMenu.close({ fadeOnly: true });
      }
      if (oldGrab) Main.popModal(oldGrab);

      menu.actor.add_action_full('popup-manager-key-controller', Clutter.EventPhase.CAPTURE, this.keyController);
      menu.actor.add_action_full('popup-manager-click-gesture', Clutter.EventPhase.CAPTURE, this.clickGesture);
      menu.actor.add_action_full('popup-manager-motion-controller', Clutter.EventPhase.CAPTURE, this.motionController);

      if (!this.keyFocusId) {
        this.keyFocusId = global.stage.connect('notify::key-focus', () => {
          if (!this.activeMenu) return;

          const newMenu = this.findMenuForSource(global.stage.get_key_focus());
          if (newMenu) this.changeMenu(newMenu);
        });
      }
    } else if (this.activeMenu === menu) {
      this.activeMenu = null;
      Main.popModal(this.grab!);
      this.grab = null;
      this.detachControllers(menu);
      this.disconnectKeyFocus();
    }
  }

  private changeMenu(newMenu: PopupMenuBase): void {
    newMenu.open({ fadeOnly: this.activeMenu != null });
  }

  private keyPress(menu: PopupMenuBase): boolean {
    const [, symbol] = this.keyController.get_key();

    if (symbol === Clutter.KEY_Down && global.stage.get_key_focus() === menu.actor) {
      menu.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
      return Clutter.EVENT_STOP;
    }
    if (symbol === Clutter.KEY_Escape && menu.isOpen) {
      menu.close();
      return Clutter.EVENT_STOP;
    }

    return Clutter.EVENT_PROPAGATE;
  }

  private checkHoveredMenu(sprite: Clutter.Sprite): void {
    const { x, y } = sprite.get_coords();
    const targetActor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, x, y);
    const hoveredMenu = this.findMenuForSource(targetActor);

    if (hoveredMenu && hoveredMenu !== this.activeMenu) this.changeMenu(hoveredMenu);
  }

  private findMenuForSource(source: Clutter.Actor | null): PopupMenuBase | null {
    while (source) {
      const actor = source;
      const menu = this.menus.find(m => m.sourceActor === actor);
      if (menu) return menu;
      source = source.get_parent();
    }

    return null;
  }
}
