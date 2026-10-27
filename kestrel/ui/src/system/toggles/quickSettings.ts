import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Pango from 'gi://Pango';
import St from 'gi://St';

import * as PopupMenu from '../../shared/popups/popupMenu.js';
import { Slider } from '../../shared/widgets/slider.js';
import { QuickToggleMenu } from './quickToggleMenu.js';

export { QuickToggleMenu } from './quickToggleMenu.js';

export interface QuickSettingsItemProps extends Partial<St.Button.ConstructorProps> {
  hasMenu?: boolean;
}

export interface QuickToggleProps extends QuickSettingsItemProps {
  title?: string | null;
  subtitle?: string | null;
  gicon?: Gio.Icon | null;
}

interface QuickMenuProps {
  menu_enabled?: boolean;
  menu_button_accessible_name?: string | null;
}

export interface QuickMenuToggleProps extends QuickToggleProps, QuickMenuProps {}

export interface QuickSliderProps extends QuickSettingsItemProps, QuickMenuProps {
  gicon?: Gio.Icon | null;
  icon_reactive?: boolean;
  icon_label?: string;
}

function iconProps(source: { gicon: Gio.Icon | null; iconName: string | null }): Partial<St.Icon.ConstructorProps> {
  const props: Partial<St.Icon.ConstructorProps> = {};
  if (source.gicon) props.gicon = source.gicon;
  if (source.iconName) props.icon_name = source.iconName;
  return props;
}

function bindIcon(icon: St.Icon, target: St.Button): void {
  const flags = GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL;
  icon.bind_property('icon-name', target, 'icon-name', flags);
  icon.bind_property('gicon', target, 'gicon', flags);
}

function menuButton(params: Partial<St.Button.ConstructorProps>): St.Button {
  return new St.Button({
    child: new St.Icon({ icon_name: 'go-next-symbolic' }),
    can_focus: true,
    x_expand: false,
    y_expand: true,
    ...params,
  });
}

export const QuickSettingsItem = GObject.registerClass({
  Properties: {
    'has-menu': GObject.ParamSpec.boolean('has-menu', null, null,
      GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, false),
  },
}, class QuickSettingsItem extends St.Button {
  declare readonly hasMenu: boolean;
  declare menu: QuickToggleMenu | undefined;
  declare menuManager: PopupMenu.PopupMenuManager | undefined;

  _init(params: QuickSettingsItemProps = {}): void {
    super._init(params);

    if (!this.hasMenu) return;

    this.menu = new QuickToggleMenu(this);
    this.menu.actor.hide();

    this.menuManager = new PopupMenu.PopupMenuManager();
    this.menuManager.addMenu(this.menu);
  }
});
export type QuickSettingsItem = InstanceType<typeof QuickSettingsItem>;

export const QuickToggle = GObject.registerClass({
  Properties: {
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE, null),
    'subtitle': GObject.ParamSpec.string('subtitle', null, null, GObject.ParamFlags.READWRITE, null),
    'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
    'gicon': GObject.ParamSpec.object('gicon', null, null, GObject.ParamFlags.READWRITE, Gio.Icon),
  },
}, class QuickToggle extends QuickSettingsItem {
  declare title: string | null;
  declare subtitle: string | null;
  declare gicon: Gio.Icon | null;
  declare private titleLabel: St.Label;
  declare private subtitleLabel: St.Label;

  _init(params: QuickToggleProps = {}): void {
    super._init({
      style_class: 'quick-toggle button',
      accessible_role: Atk.Role.TOGGLE_BUTTON,
      can_focus: true,
      ...params,
    });

    const box = new St.BoxLayout({ x_expand: true });
    this.set_child(box);

    const icon = new St.Icon({ style_class: 'quick-toggle-icon', x_expand: false, ...iconProps(this) });
    box.add_child(icon);
    bindIcon(icon, this);

    this.titleLabel = new St.Label({
      style_class: 'quick-toggle-title',
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.START,
      x_expand: true,
    });
    this.label_actor = this.titleLabel;

    this.subtitleLabel = new St.Label({
      style_class: 'quick-toggle-subtitle',
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.START,
      x_expand: true,
    });
    this.get_accessible()!.add_relationship(Atk.RelationType.DESCRIBED_BY, this.subtitleLabel.get_accessible()!);

    const titleBox = new St.BoxLayout({
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.START,
      x_expand: true,
      orientation: Clutter.Orientation.VERTICAL,
    });
    titleBox.add_child(this.titleLabel);
    titleBox.add_child(this.subtitleLabel);
    box.add_child(titleBox);

    this.titleLabel.clutter_text.ellipsize = Pango.EllipsizeMode.END;

    this.bind_property('title', this.titleLabel, 'text', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('subtitle', this.subtitleLabel, 'text', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property_full('subtitle', this.subtitleLabel, 'visible', GObject.BindingFlags.SYNC_CREATE,
      (_binding, source) => [true, source !== null], null);
  }
});
export type QuickToggle = InstanceType<typeof QuickToggle>;

export const QuickMenuToggle = GObject.registerClass({
  Properties: {
    'title': GObject.ParamSpec.string('title', null, null, GObject.ParamFlags.READWRITE, null),
    'subtitle': GObject.ParamSpec.string('subtitle', null, null, GObject.ParamFlags.READWRITE, null),
    'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
    'gicon': GObject.ParamSpec.object('gicon', null, null, GObject.ParamFlags.READWRITE, Gio.Icon),
    'menu-enabled': GObject.ParamSpec.boolean('menu-enabled', null, null, GObject.ParamFlags.READWRITE, true),
    'menu-button-accessible-name': GObject.ParamSpec.string('menu-button-accessible-name', null, null,
      GObject.ParamFlags.READWRITE, null),
  },
}, class QuickMenuToggle extends QuickSettingsItem {
  declare title: string | null;
  declare subtitle: string | null;
  declare gicon: Gio.Icon | null;
  declare menuEnabled: boolean;
  declare menu: QuickToggleMenu;
  declare menuManager: PopupMenu.PopupMenuManager;
  declare menuButton: St.Button;

  _init(params: QuickMenuToggleProps = {}): void {
    super._init({ ...params, hasMenu: true });

    this.add_style_class_name('quick-toggle-has-menu');

    const box = new St.BoxLayout({ x_expand: true });
    this.set_child(box);

    const contents = new QuickToggle({ x_expand: true });
    box.add_child(contents);

    const separator = new St.Widget({ style_class: 'quick-toggle-separator' });
    box.add_child(separator);

    this.menuButton = menuButton({ style_class: 'quick-toggle-menu-button icon-button' });
    box.add_child(this.menuButton);

    this.menuButton.bind_property('visible', separator, 'visible', GObject.BindingFlags.SYNC_CREATE);

    this.bind_property('toggle-mode', contents, 'toggle-mode', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('checked', contents, 'checked', GObject.BindingFlags.SYNC_CREATE | GObject.BindingFlags.BIDIRECTIONAL);
    this.bind_property('title', contents, 'title', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('subtitle', contents, 'subtitle', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('gicon', contents, 'gicon', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-name', contents, 'icon-name', GObject.BindingFlags.SYNC_CREATE);

    this.bind_property('menu-enabled', this.menuButton, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('menu-button-accessible-name', this.menuButton, 'accessible-name', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('reactive', this.menuButton, 'reactive', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('checked', this.menuButton, 'checked', GObject.BindingFlags.SYNC_CREATE);
    contents.connect('clicked', (_contents, button) => this.emit('clicked', button));
    this.menuButton.connect('clicked', () => this.menu.toggle());
    this.menuButton.connect('popup-menu', () => this.emit('popup-menu'));
    contents.connect('popup-menu', () => this.emit('popup-menu'));
    this.connect('popup-menu', () => {
      if (this.menuEnabled) this.menu.open();
    });
  }
});
export type QuickMenuToggle = InstanceType<typeof QuickMenuToggle>;

export namespace QuickSlider {
  export interface Signals extends St.Button.SignalSignatures {
    'icon-clicked': () => void;
  }
}

export const QuickSlider = GObject.registerClass({
  Properties: {
    'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
    'gicon': GObject.ParamSpec.object('gicon', null, null, GObject.ParamFlags.READWRITE, Gio.Icon),
    'icon-reactive': GObject.ParamSpec.boolean('icon-reactive', null, null, GObject.ParamFlags.READWRITE, false),
    'icon-label': GObject.ParamSpec.string('icon-label', null, null, GObject.ParamFlags.READWRITE, ''),
    'menu-enabled': GObject.ParamSpec.boolean('menu-enabled', null, null, GObject.ParamFlags.READWRITE, false),
    'menu-button-accessible-name': GObject.ParamSpec.string('menu-button-accessible-name', null, null,
      GObject.ParamFlags.READWRITE, null),
  },
  Signals: {
    'icon-clicked': {},
  },
}, class QuickSlider extends QuickSettingsItem {
  declare connect: GObject.SignalMethods<this, QuickSlider.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, QuickSlider.Signals>['emit'];

  declare gicon: Gio.Icon | null;
  declare menuEnabled: boolean;
  declare menu: QuickToggleMenu;
  declare menuManager: PopupMenu.PopupMenuManager;
  declare slider: Slider;
  declare menuButton: St.Button;

  _init(params: QuickSliderProps = {}): void {
    super._init({
      style_class: 'quick-slider',
      ...params,
      can_focus: false,
      reactive: false,
      hasMenu: true,
    });

    const box = new St.BoxLayout({ x_expand: true });
    this.set_child(box);

    const icon = new St.Icon(iconProps(this));
    const iconButton = new St.Button({
      child: icon,
      style_class: 'icon-button flat',
      can_focus: true,
      x_expand: false,
      y_expand: true,
    });
    iconButton.connect('clicked', () => this.emit('icon-clicked'));
    iconButton.connect('notify::reactive', () => iconButton.remove_style_pseudo_class('insensitive'));
    box.add_child(iconButton);

    this.bind_property('icon-reactive', iconButton, 'reactive', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-reactive', iconButton, 'can-focus', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('icon-label', iconButton, 'accessible-name', GObject.BindingFlags.SYNC_CREATE);

    bindIcon(icon, this);

    this.slider = new Slider(0);

    const sliderBin = new St.Bin({
      style_class: 'slider-bin',
      child: this.slider,
      reactive: true,
      x_expand: true,
      y_align: Clutter.ActorAlign.CENTER,
    });
    box.add_child(sliderBin);

    this.slider.connectObject(
      'key-focus-in', () => sliderBin.add_style_pseudo_class('focus'),
      'key-focus-out', () => sliderBin.remove_style_pseudo_class('focus'),
      this);

    this.menuButton = menuButton({ style_class: 'icon-button flat' });
    box.add_child(this.menuButton);

    this.bind_property('menu-button-accessible-name', this.menuButton, 'accessible-name', GObject.BindingFlags.SYNC_CREATE);
    this.bind_property('menu-enabled', this.menuButton, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.menuButton.connect('clicked', () => this.menu.toggle());
    this.slider.connect('popup-menu', () => {
      if (this.menuEnabled) this.menu.open();
    });
  }
});
export type QuickSlider = InstanceType<typeof QuickSlider>;

export const SystemIndicator = GObject.registerClass(class SystemIndicator extends St.BoxLayout {
  declare quickSettingsItems: QuickSettingsItem[];

  _init(): void {
    super._init({
      style_class: 'panel-status-indicators-box',
      reactive: true,
      visible: false,
    });

    this.quickSettingsItems = [];
  }

  private syncIndicatorsVisible(): void {
    this.visible = this.get_children().some(a => a.visible);
  }

  _addIndicator(): St.Icon {
    const icon = new St.Icon({ style_class: 'system-status-icon' });
    this.add_child(icon);
    icon.connect('notify::visible', () => this.syncIndicatorsVisible());
    this.syncIndicatorsVisible();
    return icon;
  }
});
export type SystemIndicator = InstanceType<typeof SystemIndicator>;
