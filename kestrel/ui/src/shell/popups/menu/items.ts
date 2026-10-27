import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';

import type { PopupMenuBase } from './menuBase.js';

export const Ornament = {
  NONE: 0,
  DOT: 1,
  CHECK: 2,
  HIDDEN: 3,
  NO_DOT: 4,
} as const;
export type Ornament = typeof Ornament[keyof typeof Ornament];

const ARROW_ICONS: Record<St.Side, string> = {
  [St.Side.TOP]: 'pan-up-symbolic',
  [St.Side.RIGHT]: 'pan-end-symbolic',
  [St.Side.BOTTOM]: 'pan-down-symbolic',
  [St.Side.LEFT]: 'pan-start-symbolic',
};

export function arrowIcon(side: St.Side): St.Icon {
  return new St.Icon({
    style_class: 'popup-menu-arrow',
    icon_name: ARROW_ICONS[side],
    accessible_role: Atk.Role.ARROW,
    y_expand: true,
    y_align: Clutter.ActorAlign.CENTER,
  });
}

export interface PopupBaseMenuItemOptions {
  reactive?: boolean;
  activate?: boolean;
  hover?: boolean;
  style_class?: string | null;
  can_focus?: boolean;
}

export namespace PopupBaseMenuItem {
  export interface Signals extends St.BoxLayout.SignalSignatures {
    'activate': (event: Clutter.Event | null) => void;
  }
}

export const PopupBaseMenuItem = GObject.registerClass({
  Properties: {
    'active': GObject.ParamSpec.boolean('active', null, null, GObject.ParamFlags.READWRITE, false),
    'sensitive': GObject.ParamSpec.boolean('sensitive', null, null, GObject.ParamFlags.READWRITE, true),
  },
  Signals: {
    'activate': { param_types: [Clutter.Event.$gtype] },
  },
}, class PopupBaseMenuItem extends St.BoxLayout {
  declare connect: GObject.SignalMethods<this, PopupBaseMenuItem.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, PopupBaseMenuItem.Signals>['emit'];

  declare _delegate: PopupBaseMenuItem;
  declare protected ornamentIcon: St.Icon;
  declare protected parentMenu: PopupMenuBase | null;
  declare private ornament: Ornament | undefined;
  declare private activeState: boolean;
  declare private activatable: boolean;
  declare private sensitiveState: boolean;
  declare private clickGesture: Clutter.ClickGesture;

  _init({
    reactive = true,
    activate = true,
    hover = true,
    style_class = null,
    can_focus = true,
  }: PopupBaseMenuItemOptions = {}): void {
    super._init({
      style_class: 'popup-menu-item',
      reactive,
      track_hover: reactive,
      can_focus,
      accessible_role: Atk.Role.MENU_ITEM,
    });
    this._delegate = this;

    this.ornamentIcon = new St.Icon({ style_class: 'popup-menu-ornament' });
    this.add_child(this.ornamentIcon);
    this.setOrnament(Ornament.HIDDEN);

    this.parentMenu = null;
    this.activeState = false;
    this.activatable = reactive && activate;
    this.sensitiveState = true;

    this.clickGesture = new Clutter.ClickGesture({ enabled: this.activatable });
    this.clickGesture.connect('recognize', () => this.activate(Clutter.get_current_event()));
    this.clickGesture.connect('notify::pressed', () => {
      if (this.clickGesture.pressed) this.add_style_pseudo_class('active');
      else this.remove_style_pseudo_class('active');
    });
    this.add_action(this.clickGesture);

    if (!this.activatable) this.add_style_class_name('popup-inactive-menu-item');
    if (style_class) this.add_style_class_name(style_class);
    if (reactive && hover) this.bind_property('hover', this, 'active', GObject.BindingFlags.SYNC_CREATE);
  }

  activateBinding(): boolean {
    if (!this.activatable) return Clutter.EVENT_PROPAGATE;

    this.activate(Clutter.get_current_event());
    return Clutter.EVENT_STOP;
  }

  get actor(): this {
    return this;
  }

  setParent(parent: PopupMenuBase | null): void {
    this.parentMenu = parent;
  }

  vfunc_key_focus_in(): void {
    super.vfunc_key_focus_in();
    this.active = true;
  }

  vfunc_key_focus_out(): void {
    super.vfunc_key_focus_out();
    this.active = false;
  }

  activate(event: Clutter.Event | null): void {
    this.emit('activate', event);
  }

  get active(): boolean {
    return this.activeState;
  }

  set active(active: boolean) {
    if (active === this.active) return;

    this.activeState = active;
    if (active) {
      this.add_style_pseudo_class('selected');
      if (this.can_focus) this.grab_key_focus();
    } else {
      this.remove_style_pseudo_class('selected');
      this.remove_style_pseudo_class('active');
    }
    this.notify('active');
  }

  syncSensitive(): boolean {
    const sensitive = this.sensitive;
    this.reactive = sensitive;
    this.can_focus = sensitive;
    this.notify('sensitive');
    return sensitive;
  }

  getSensitive(): boolean {
    const parentSensitive = this.parentMenu?.sensitive ?? true;
    return this.activatable && this.sensitiveState && parentSensitive;
  }

  setSensitive(sensitive: boolean): void {
    if (this.sensitiveState === sensitive) return;

    this.sensitiveState = sensitive;
    this.syncSensitive();
  }

  get sensitive(): boolean {
    return this.getSensitive();
  }

  set sensitive(sensitive: boolean) {
    this.setSensitive(sensitive);
  }

  setOrnament(ornament: Ornament): void {
    if (ornament === this.ornament) return;

    this.ornament = ornament;

    if (ornament === Ornament.DOT) {
      this.ornamentIcon.icon_name = 'ornament-dot-checked-symbolic';
      this.add_accessible_state(Atk.StateType.CHECKED);
    } else if (ornament === Ornament.NO_DOT) {
      this.ornamentIcon.icon_name = 'ornament-dot-unchecked-symbolic';
      this.remove_accessible_state(Atk.StateType.CHECKED);
    } else if (ornament === Ornament.CHECK) {
      this.ornamentIcon.icon_name = 'ornament-check-symbolic';
      this.add_accessible_state(Atk.StateType.CHECKED);
    } else {
      this.ornamentIcon.icon_name = '';
      this.remove_accessible_state(Atk.StateType.CHECKED);
    }

    this.ornamentIcon.visible = ornament !== Ornament.HIDDEN;
    this.updateOrnamentStyle();
  }

  protected updateOrnamentStyle(): void {
    if (this.ornament === Ornament.CHECK || this.ornament === Ornament.NONE)
      this.add_style_class_name('popup-ornamented-menu-item');
    else
      this.remove_style_class_name('popup-ornamented-menu-item');
  }
});
export type PopupBaseMenuItem = InstanceType<typeof PopupBaseMenuItem>;

const activateBinding = ((item: PopupBaseMenuItem) => item.activateBinding()) as unknown as GObject.Closure;
const itemBindings = (PopupBaseMenuItem as unknown as typeof St.Widget).get_binding_pool();
itemBindings.install_closure('activate', Clutter.KEY_space, 0 as Clutter.ModifierType, activateBinding);
itemBindings.install_closure('activate', Clutter.KEY_Return, 0 as Clutter.ModifierType, activateBinding);

function itemLabel(text: string): St.Label {
  return new St.Label({ text, y_expand: true, y_align: Clutter.ActorAlign.CENTER });
}

export class PopupMenuItem extends PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  readonly label: St.Label;

  constructor(text: string, params?: PopupBaseMenuItemOptions) {
    super(params);

    this.label = itemLabel(text);
    this.add_child(this.label);
    this.label_actor = this.label;
  }
}

export class PopupSeparatorMenuItem extends PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  readonly label: St.Label;

  constructor(text?: string) {
    super({
      style_class: 'popup-separator-menu-item',
      reactive: false,
      can_focus: false,
    });

    this.label = new St.Label({ text: text || '' });
    this.add_child(this.label);
    this.label_actor = this.label;
    this.accessible_role = Atk.Role.SEPARATOR;

    this.label.connect('notify::text', () => this.syncVisibility());
    this.syncVisibility();

    this.add_child(new St.Widget({
      style_class: 'popup-separator-menu-item-separator',
      x_expand: true,
      y_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    }));
  }

  private syncVisibility(): void {
    this.label.visible = this.label.text !== '';
  }
}

export class PopupImageMenuItem extends PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  readonly icon = new St.Icon({ style_class: 'popup-menu-icon', x_align: Clutter.ActorAlign.END });
  readonly label: St.Label;

  constructor(text: string, icon: Gio.Icon | string, params?: PopupBaseMenuItemOptions) {
    super(params);

    this.add_child(this.icon);
    this.label = itemLabel(text);
    this.add_child(this.label);
    this.label_actor = this.label;

    this.set_child_above_sibling(this.ornamentIcon, this.label);

    this.setIcon(icon);
  }

  setIcon(icon: Gio.Icon | string): void {
    if (icon instanceof GObject.Object && GObject.type_is_a(icon, Gio.Icon)) this.icon.gicon = icon;
    else this.icon.icon_name = icon as string;
  }

  protected updateOrnamentStyle(): void {}
}
