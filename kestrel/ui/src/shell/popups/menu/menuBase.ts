import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import type Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';

import * as Main from '../../main.js';
import { EventEmitter } from '../../runtime/signals.js';
import * as Util from '../../runtime/util.js';
import { arrowIcon, PopupBaseMenuItem, PopupImageMenuItem, PopupMenuItem, PopupSeparatorMenuItem } from './items.js';
import { hasVisibleItems, separatesItems, type MenuChild } from './separators.js';

export interface MenuCloseParams {
  animate?: boolean;
  fadeOnly?: boolean;
}

export interface MenuOpenParams extends MenuCloseParams {
  triggerEvent?: Clutter.Event | null;
}

export type MenuItem = PopupBaseMenuItem | PopupMenuSection;

export namespace PopupMenuBase {
  export interface Signals {
    'open-state-changed': (open: boolean) => void;
    'active-changed': (item: PopupBaseMenuItem | null) => void;
    'activate': (item: PopupBaseMenuItem) => void;
    'menu-closed': () => void;
    'notify::sensitive': () => void;
    'destroy': () => void;
  }
}

export abstract class PopupMenuBase extends EventEmitter {
  declare connect: GObject.SignalMethods<this, PopupMenuBase.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, PopupMenuBase.Signals>['emit'];

  declare actor: St.Widget;
  readonly box = new St.BoxLayout({ orientation: Clutter.Orientation.VERTICAL, x_expand: true, y_expand: true });
  length = 0;
  isOpen = false;
  protected parentMenu: PopupMenuBase | null = null;
  protected activeMenuItem: PopupBaseMenuItem | null = null;
  private openedSubMenu: PopupSubMenu | null = null;
  private readonly settingsActions: PopupBaseMenuItem[] = [];
  protected sensitiveState = true;

  constructor(readonly sourceActor: Clutter.Actor | null = null, styleClass?: string) {
    super();

    if (styleClass !== undefined) this.box.style_class = styleClass;

    Main.sessionMode.connectObject('updated', () => this.sessionUpdated(), this);
  }

  getTopMenu(): PopupMenuBase {
    return this.parentMenu ? this.parentMenu.getTopMenu() : this;
  }

  setParent(parent: PopupMenuBase | null): void {
    this.parentMenu = parent;
  }

  setOpenedSubMenu(submenu: PopupSubMenu | null): void {
    this.openedSubMenu?.close();
    this.openedSubMenu = submenu;
  }

  getSensitive(): boolean {
    const parentSensitive = this.parentMenu?.sensitive ?? true;
    return this.sensitiveState && parentSensitive;
  }

  setSensitive(sensitive: boolean): void {
    this.sensitiveState = sensitive;
    this.emit('notify::sensitive');
  }

  get sensitive(): boolean {
    return this.getSensitive();
  }

  set sensitive(sensitive: boolean) {
    this.setSensitive(sensitive);
  }

  private sessionUpdated(): void {
    this.setSettingsVisibility(Main.sessionMode.allowSettings);
    this.close();
  }

  addAction(title: string, callback: (event: Clutter.Event | null) => void, icon?: Gio.Icon | string): PopupMenuItem | PopupImageMenuItem {
    const menuItem = icon !== undefined ? new PopupImageMenuItem(title, icon) : new PopupMenuItem(title);

    this.addMenuItem(menuItem);
    menuItem.connect('activate', (_item, event) => callback(event));

    return menuItem;
  }

  addSettingsAction(title: string, page: string): PopupMenuItem | PopupImageMenuItem {
    const menuItem = this.addAction(title, () => Util.openSettings(page));

    menuItem.visible = Main.sessionMode.allowSettings;
    this.settingsActions.push(menuItem);

    return menuItem;
  }

  private setSettingsVisibility(visible: boolean): void {
    for (const item of this.settingsActions) item.visible = visible;
  }

  isEmpty(): boolean {
    return !hasVisibleItems(this.box.get_children());
  }

  itemActivated(params?: MenuCloseParams): void {
    this.getTopMenu().close(params);
  }

  private subMenuActiveChanged(submenuItem: PopupBaseMenuItem | null): void {
    if (this.activeMenuItem === submenuItem) return;

    if (this.activeMenuItem) this.activeMenuItem.active = false;
    this.activeMenuItem = submenuItem;

    submenuItem?.connectObject('destroy', () => {
      if (this.activeMenuItem === submenuItem) this.activeMenuItem = null;
    }, this);

    this.emit('active-changed', submenuItem);
  }

  private connectItemSignals(menuItem: PopupBaseMenuItem): void {
    menuItem.connectObject(
      'notify::active', () => {
        const { active } = menuItem;
        if (active && this.activeMenuItem !== menuItem) {
          if (this.activeMenuItem) this.activeMenuItem.active = false;
          this.activeMenuItem = menuItem;
          this.emit('active-changed', menuItem);
        } else if (!active && this.activeMenuItem === menuItem) {
          this.activeMenuItem = null;
          this.emit('active-changed', null);
        }
      },
      'notify::sensitive', () => {
        const { sensitive } = menuItem;
        if (!sensitive && this.activeMenuItem === menuItem) {
          if (!this.actor.navigate_focus(menuItem.actor, St.DirectionType.TAB_FORWARD, true)) this.actor.grab_key_focus();
        } else if (sensitive && this.activeMenuItem === null) {
          if (global.stage.get_key_focus() === this.actor) menuItem.actor.grab_key_focus();
        }
      },
      'activate', () => {
        this.emit('activate', menuItem);
        this.itemActivated();
      }, GObject.ConnectFlags.AFTER,
      'destroy', () => {
        if (menuItem === this.activeMenuItem) this.activeMenuItem = null;
      }, this);

    this.connectObject('notify::sensitive', () => menuItem.syncSensitive(), menuItem);
  }

  private updateSeparatorVisibility(menuItem: PopupSeparatorMenuItem): void {
    if (menuItem.label.text) return;

    const children: MenuChild[] = this.box.get_children();
    const index = children.indexOf(menuItem.actor);
    if (index < 0) return;

    if (separatesItems(children, index)) menuItem.show();
    else menuItem.actor.hide();
  }

  moveMenuItem(menuItem: MenuItem, position: number): void {
    const items = this.getMenuItems();
    let i = 0;

    while (i < items.length && position > 0) {
      if (items[i] !== menuItem) position--;
      i++;
    }

    if (i < items.length) {
      if (items[i] !== menuItem) this.box.set_child_below_sibling(menuItem.actor, items[i].actor);
    } else {
      this.box.set_child_above_sibling(menuItem.actor, null);
    }
  }

  addMenuItem(menuItem: MenuItem, position?: number): void {
    let beforeItem: St.Widget | null = null;
    if (position === undefined) {
      this.box.add_child(menuItem.actor);
    } else {
      const items = this.getMenuItems();
      if (position < items.length) {
        beforeItem = items[position].actor;
        this.box.insert_child_below(menuItem.actor, beforeItem);
      } else {
        this.box.add_child(menuItem.actor);
      }
    }

    if (menuItem instanceof PopupMenuSection) {
      menuItem.connectObject(
        'active-changed', (_menu: PopupMenuBase, item: PopupBaseMenuItem | null) => this.subMenuActiveChanged(item),
        'destroy', () => {
          this.length--;
          this.disconnectObject(menuItem);
          menuItem.disconnectObject(this);
        }, this);

      this.connectObject(
        'open-state-changed', (_self: PopupMenuBase, open: boolean) => {
          if (open) menuItem.open();
          else menuItem.close();
        },
        'menu-closed', () => menuItem.emit('menu-closed'),
        'notify::sensitive', () => menuItem.emit('notify::sensitive'),
        menuItem);
    } else if (menuItem instanceof PopupSubMenuMenuItem) {
      if (beforeItem == null) this.box.add_child(menuItem.menu.actor);
      else this.box.insert_child_below(menuItem.menu.actor, beforeItem);

      this.connectItemSignals(menuItem);
      menuItem.menu.connectObject(
        'active-changed', (_menu: PopupMenuBase, item: PopupBaseMenuItem | null) => this.subMenuActiveChanged(item),
        'destroy', () => menuItem.menu.disconnectObject(this),
        this);
      this.connectObject('menu-closed', () => menuItem.menu.close({ animate: false }), menuItem);
    } else if (menuItem instanceof PopupSeparatorMenuItem) {
      this.connectItemSignals(menuItem);
      this.connectObject('open-state-changed', () => this.updateSeparatorVisibility(menuItem), menuItem);
    } else if (menuItem instanceof PopupBaseMenuItem) {
      this.connectItemSignals(menuItem);
    } else {
      throw TypeError('Invalid argument to PopupMenuBase.addMenuItem()');
    }

    menuItem.setParent(this);

    this.length++;
  }

  private getMenuItems(): MenuItem[] {
    return this.box.get_children()
      .map((actor: MenuChild) => actor._delegate)
      .filter((item): item is MenuItem => item instanceof PopupBaseMenuItem || item instanceof PopupMenuSection);
  }

  removeAll(): void {
    for (const item of this.getMenuItems()) item.destroy();
  }

  private maybeStartKeynav({ triggerEvent }: MenuOpenParams): void {
    let currentEvent = triggerEvent;
    if (currentEvent === undefined) {
      currentEvent = Clutter.get_current_event();
      if (global.backend.get_last_input_device() !== currentEvent?.get_source_device()) return;
    }
    switch (currentEvent?.type()) {
      case Clutter.EventType.KEY_PRESS:
      case Clutter.EventType.KEY_RELEASE:
        this.actor.navigate_focus(null, St.DirectionType.TAB_FORWARD, false);
        break;
    }
  }

  open(params: MenuOpenParams = {}): boolean {
    if (this.isOpen) return false;
    if (this.isEmpty()) return false;

    this.isOpen = true;
    this.emit('open-state-changed', true);
    this.actor.show();
    this.maybeStartKeynav(params);
    return true;
  }

  close(_params?: MenuCloseParams): boolean {
    if (!this.isOpen) return false;

    this.isOpen = false;
    this.emit('open-state-changed', false);
    return true;
  }

  toggle(): void {
    if (this.isOpen) this.close();
    else this.open();
  }

  destroy(): void {
    this.close();
    this.removeAll();
    this.actor.destroy();

    this.emit('destroy');

    Main.sessionMode.disconnectObject(this);
  }
}

export class PopupMenuSection extends PopupMenuBase {
  declare actor: St.BoxLayout;

  constructor() {
    super();

    this.actor = this.box;
    (this.actor as MenuChild)._delegate = this;
    this.isOpen = true;

    this.actor.add_style_class_name('popup-menu-section');
  }

  open(): boolean {
    this.emit('open-state-changed', true);
    return true;
  }

  close(): boolean {
    this.emit('open-state-changed', false);
    return true;
  }
}

const SUBMENU_ANIMATION_TIME = 250;

export class PopupSubMenu extends PopupMenuBase {
  declare actor: St.ScrollView;
  declare readonly sourceActor: PopupSubMenuMenuItem;

  constructor(sourceActor: PopupSubMenuMenuItem, private readonly arrow: St.Icon) {
    super(sourceActor);

    this.actor = new St.ScrollView({
      style_class: 'popup-sub-menu',
      vscrollbar_policy: St.PolicyType.NEVER,
      child: this.box,
    });

    (this.actor as MenuChild)._delegate = this;
    this.actor.clip_to_allocation = true;
    this.actor.hide();

    const keyController = new Clutter.KeyController();
    keyController.connect('key-press', controller => this.onKeyPress(controller));
    this.actor.add_action(keyController);
  }

  private needsScrollbar(): boolean {
    const topMenu = this.getTopMenu();
    const [, topNaturalHeight] = topMenu.actor.get_preferred_height(-1);
    const topMaxHeight = topMenu.actor.get_theme_node().get_max_height();
    return topMaxHeight >= 0 && topNaturalHeight >= topMaxHeight;
  }

  getSensitive(): boolean {
    return this.sensitiveState && this.sourceActor.sensitive;
  }

  open(params: MenuOpenParams = {}): boolean {
    if (!super.open(params)) return false;

    const needsScrollbar = this.needsScrollbar();
    this.actor.vscrollbar_policy = needsScrollbar ? St.PolicyType.AUTOMATIC : St.PolicyType.NEVER;

    if (needsScrollbar) this.actor.add_style_pseudo_class('scrolled');
    else this.actor.remove_style_pseudo_class('scrolled');

    const animate = (params.animate ?? true) && !needsScrollbar;
    const targetAngle = this.actor.text_direction === Clutter.TextDirection.RTL ? -90 : 90;
    const duration = animate ? SUBMENU_ANIMATION_TIME : 0;
    const [, naturalHeight] = this.actor.get_preferred_height(-1);
    this.actor.height = 0;
    this.actor.ease({
      height: naturalHeight,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_EXPO,
      onComplete: () => this.actor.set_height(-1),
    });
    this.arrow.ease({
      rotation_angle_z: targetAngle,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_EXPO,
    });
    return true;
  }

  close(params: MenuCloseParams = {}): boolean {
    if (!super.close(params)) return false;

    if (this.activeMenuItem) this.activeMenuItem.active = false;

    const animate = (params.animate ?? true) && !this.needsScrollbar();
    const duration = animate ? SUBMENU_ANIMATION_TIME : 0;
    this.actor.ease({
      height: 0,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_EXPO,
      onComplete: () => {
        this.actor.hide();
        this.actor.set_height(-1);
      },
    });
    this.arrow.ease({
      rotation_angle_z: 0,
      duration,
      mode: Clutter.AnimationMode.EASE_OUT_EXPO,
    });
    return true;
  }

  private onKeyPress(controller: Clutter.KeyController): boolean {
    const [, symbol] = controller.get_key();

    if (this.isOpen && symbol === Clutter.KEY_Left) {
      this.close();
      this.sourceActor.grab_key_focus();
      return Clutter.EVENT_STOP;
    }

    return Clutter.EVENT_PROPAGATE;
  }
}

export class PopupSubMenuMenuItem extends PopupBaseMenuItem {
  static {
    GObject.registerClass(this);

    (this as unknown as typeof St.Widget).get_binding_pool().install_closure('open', Clutter.KEY_Right, 0 as Clutter.ModifierType, ((item: PopupSubMenuMenuItem) => {
      item.setSubmenuShown(true);
      item.menu.actor.navigate_focus(null, St.DirectionType.DOWN, false);
      return Clutter.EVENT_STOP;
    }) as unknown as GObject.Closure);
  }

  readonly icon: St.Icon | undefined;
  readonly label: St.Label;
  readonly menu: PopupSubMenu;
  private readonly triangle: St.Icon;

  constructor(text: string, wantIcon?: boolean) {
    super();

    this.add_style_class_name('popup-submenu-menu-item');

    if (wantIcon) {
      this.icon = new St.Icon({ style_class: 'popup-menu-icon' });
      this.add_child(this.icon);
    }

    this.label = new St.Label({ text, y_expand: true, y_align: Clutter.ActorAlign.CENTER });
    this.add_child(this.label);
    this.label_actor = this.label;

    this.add_child(new St.Bin({ style_class: 'popup-menu-item-expander', x_expand: true }));

    this.triangle = arrowIcon(St.Side.RIGHT);
    this.triangle.pivot_point = new Graphene.Point({ x: 0.5, y: 0.6 });

    const triangleBin = new St.Widget({ y_expand: true, y_align: Clutter.ActorAlign.CENTER });
    triangleBin.add_child(this.triangle);

    this.add_child(triangleBin);
    this.add_accessible_state(Atk.StateType.EXPANDABLE);

    this.menu = new PopupSubMenu(this, this.triangle);
    this.menu.connect('open-state-changed', (_menu, open) => this.subMenuOpenStateChanged(open));
    this.connect('destroy', () => this.menu.destroy());
  }

  setParent(parent: PopupMenuBase | null): void {
    super.setParent(parent);
    this.menu.setParent(parent);
  }

  syncSensitive(): boolean {
    const sensitive = super.syncSensitive();
    this.triangle.visible = sensitive;
    if (!sensitive) this.menu.close();
    return sensitive;
  }

  private subMenuOpenStateChanged(open: boolean): void {
    const topMenu = this.parentMenu!.getTopMenu();
    if (open) {
      this.add_style_pseudo_class('open');
      topMenu.setOpenedSubMenu(this.menu);
      this.add_accessible_state(Atk.StateType.EXPANDED);
      this.add_style_pseudo_class('checked');
    } else {
      this.remove_style_pseudo_class('open');
      topMenu.setOpenedSubMenu(null);
      this.remove_accessible_state(Atk.StateType.EXPANDED);
      this.remove_style_pseudo_class('checked');
    }
  }

  setSubmenuShown(open: boolean): void {
    if (open) this.menu.open();
    else this.menu.close();
  }

  activate(_event: Clutter.Event | null): void {
    this.setSubmenuShown(!this.menu.isOpen);
  }
}
