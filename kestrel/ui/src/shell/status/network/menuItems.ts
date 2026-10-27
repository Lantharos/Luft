import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../popups/popupMenu.js';
import { connectionName } from './nmUtils.js';

export interface ConnectionSection {
  activateConnection(connection: NM.RemoteConnection): void;
  deactivateConnection(activeConnection: NM.ActiveConnection): void;
}

export class NMMenuItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass({
      Properties: {
        'radio-mode': GObject.ParamSpec.boolean('radio-mode', null, null, GObject.ParamFlags.READWRITE, false),
        'is-active': GObject.ParamSpec.boolean('is-active', null, null, GObject.ParamFlags.READABLE, false),
        'name': GObject.ParamSpec.string('name', null, null, GObject.ParamFlags.READWRITE, ''),
        'icon-name': GObject.ParamSpec.string('icon-name', null, null, GObject.ParamFlags.READWRITE, ''),
      },
    }, this);
  }

  declare radioMode: boolean;
  protected activeConnection: NM.ActiveConnection | null = null;

  get state(): NM.ActiveConnectionState {
    return this.activeConnection?.state ?? NM.ActiveConnectionState.DEACTIVATED;
  }

  get is_active(): boolean {
    return this.state <= NM.ActiveConnectionState.ACTIVATED;
  }

  get timestamp(): number {
    return 0;
  }

  activate(): void {
    super.activate(Clutter.get_current_event());
  }

  protected activeConnectionStateChanged(): void {
    this.notify('is-active');
    this.notify('icon-name');
    this.sync();
  }

  setActiveConnection(activeConnection: NM.ActiveConnection | null): void {
    this.activeConnection?.disconnectObject(this);
    this.activeConnection = activeConnection;
    this.activeConnection?.connectObject('notify::state', () => this.activeConnectionStateChanged(), this);
    this.activeConnectionStateChanged();
  }

  protected sync(): void {}
}

export class NMSectionItem extends NMMenuItem {
  static {
    GObject.registerClass({
      Properties: {
        'use-submenu': GObject.ParamSpec.boolean('use-submenu', null, null, GObject.ParamFlags.READWRITE, false),
      },
    }, this);
  }

  readonly section = new PopupMenu.PopupMenuSection();
  private useSubmenuValue = false;
  private readonly mainSection = new PopupMenu.PopupMenuSection();
  private readonly submenuItem = new PopupMenu.PopupSubMenuMenuItem('', true);

  constructor() {
    super({ activate: false, can_focus: false });

    this.style_class = '';
    this.add_child(this.mainSection.actor);

    this.mainSection.addMenuItem(this.submenuItem);
    this.submenuItem.hide();
    this.mainSection.addMenuItem(this.section);

    this.bind_property('name', this.submenuItem.label, 'text', GObject.BindingFlags.DEFAULT);
    this.bind_property('icon-name', this.submenuItem.icon!, 'icon-name', GObject.BindingFlags.DEFAULT);
  }

  setParent(parent: PopupMenu.PopupMenuBase | null): void {
    super.setParent(parent);
    this.mainSection.setParent(parent);
    parent?.connect('menu-closed', () => this.mainSection.emit('menu-closed'));
  }

  get use_submenu(): boolean {
    return this.useSubmenuValue;
  }

  set use_submenu(useSubmenu: boolean) {
    if (this.useSubmenuValue === useSubmenu) return;

    this.useSubmenuValue = useSubmenu;
    this.submenuItem.visible = useSubmenu;

    if (useSubmenu) {
      this.mainSection.box.remove_child(this.section.actor);
      this.submenuItem.menu.box.add_child(this.section.actor);
    } else {
      this.submenuItem.menu.box.remove_child(this.section.actor);
      this.mainSection.box.add_child(this.section.actor);
    }
  }
}

export class NMConnectionItem extends NMMenuItem {
  static {
    GObject.registerClass(this);
  }

  protected readonly icon: St.Icon;
  protected readonly label: St.Label;
  private readonly subtitle: St.Label;

  constructor(private readonly connectionSection: ConnectionSection, protected connection: NM.RemoteConnection) {
    super();

    this.icon = new St.Icon({
      style_class: 'popup-menu-icon',
      x_align: Clutter.ActorAlign.END,
      visible: !this.radioMode,
    });
    this.add_child(this.icon);

    this.label = new St.Label({ x_expand: true, y_expand: true, y_align: Clutter.ActorAlign.CENTER });
    this.add_child(this.label);

    this.subtitle = new St.Label({ style_class: 'device-subtitle', y_expand: true, y_align: Clutter.ActorAlign.CENTER });
    this.add_child(this.subtitle);

    this.bind_property('icon-name', this.icon, 'icon-name', GObject.BindingFlags.DEFAULT);
    this.bind_property('radio-mode', this.icon, 'visible', GObject.BindingFlags.INVERT_BOOLEAN);

    this.connectObject(
      'notify::radio-mode', () => this.sync(),
      'notify::name', () => this.sync(),
      this);
    KestrelUi.localized(this, () => this.sync());
  }

  get name(): string {
    return this.connection.get_id();
  }

  get timestamp(): number {
    return this.connection.get_setting_connection()?.get_timestamp() ?? 0;
  }

  updateForConnection(connection: NM.RemoteConnection): void {
    this.connection = connection;
    this.notify('name');
    this.sync();
  }

  protected sync(): void {
    this.label.text = this.name;

    if (this.radioMode) {
      this.subtitle.text = '';
      this.accessible_name = this.name;
      this.accessible_role = Atk.Role.CHECK_MENU_ITEM;
      this.setOrnament(this.is_active ? PopupMenu.Ornament.DOT : PopupMenu.Ornament.NO_DOT);
    } else {
      this.accessible_name = KestrelUi.t(this.is_active ? 'network-menu-disconnect-from' : 'network-menu-connect-to', { name: this.name });
      this.subtitle.text = KestrelUi.t(this.is_active ? 'network-menu-disconnect' : 'network-menu-connect');
      this.accessible_role = Atk.Role.MENU_ITEM;
      this.setOrnament(PopupMenu.Ornament.HIDDEN);
    }
  }

  activate(): void {
    super.activate();

    if (this.radioMode && this.activeConnection != null) return;

    if (this.activeConnection == null) this.connectionSection.activateConnection(this.connection);
    else this.connectionSection.deactivateConnection(this.activeConnection);

    this.sync();
  }
}

export class NMDeviceConnectionItem extends NMConnectionItem {
  static {
    GObject.registerClass({
      Properties: {
        'device-name': GObject.ParamSpec.string('device-name', null, null, GObject.ParamFlags.READWRITE, ''),
      },
    }, this);
  }

  declare deviceName: string;

  constructor(section: ConnectionSection, connection: NM.RemoteConnection) {
    super(section, connection);

    this.connectObject(
      'notify::radio-mode', () => this.notify('name'),
      'notify::device-name', () => this.notify('name'),
      this);
  }

  get name(): string {
    return this.radioMode ? connectionName(this.connection, this.deviceName) : this.deviceName;
  }
}
