import Atk from 'gi://Atk';
import GObject from 'gi://GObject';
import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../../shared/popups/popupMenu.js';
import { NMConnectionItem, type ConnectionSection } from './menuItems.js';
import { NMToggle } from './toggle.js';

const VPN_SETTING_TYPES = [NM.SETTING_VPN_SETTING_NAME, NM.SETTING_WIREGUARD_SETTING_NAME];

export namespace NMVpnConnectionItem {
  export interface Signals extends PopupMenu.PopupBaseMenuItem.Signals {
    'activation-failed': () => void;
  }
}

export class NMVpnConnectionItem extends NMConnectionItem {
  static {
    GObject.registerClass({
      Signals: {
        'activation-failed': {},
      },
    }, this);
  }

  declare connect: GObject.SignalMethods<this, NMVpnConnectionItem.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, NMVpnConnectionItem.Signals>['emit'];

  private readonly switch: PopupMenu.Switch;

  constructor(section: ConnectionSection, connection: NM.RemoteConnection) {
    super(section, connection);

    this.label.x_expand = true;
    this.accessible_role = Atk.Role.CHECK_MENU_ITEM;
    this.icon.hide();
    this.label_actor = this.label;

    this.switch = new PopupMenu.Switch(this.is_active);
    this.add_child(this.switch);

    this.bind_property('is-active', this.switch, 'state', GObject.BindingFlags.SYNC_CREATE);

    this.switch.connect('notify::state', () => {
      if (this.is_active === this.switch.state) return;
      this.activate();
    });

    this.bind_property('name', this.label, 'text', GObject.BindingFlags.SYNC_CREATE);
  }

  protected sync(): void {
    if (this.is_active) this.add_accessible_state(Atk.StateType.CHECKED);
    else this.remove_accessible_state(Atk.StateType.CHECKED);
  }

  protected activeConnectionStateChanged(): void {
    const state = this.activeConnection?.get_state();
    const reason = this.activeConnection?.get_state_reason();

    if (state === NM.ActiveConnectionState.DEACTIVATED &&
      reason !== NM.ActiveConnectionStateReason.NO_SECRETS &&
      reason !== NM.ActiveConnectionStateReason.USER_DISCONNECTED)
      this.emit('activation-failed');

    super.activeConnectionStateChanged();
  }

  get icon_name(): string {
    switch (this.state) {
      case NM.ActiveConnectionState.ACTIVATING:
        return 'network-vpn-acquiring-symbolic';
      case NM.ActiveConnectionState.ACTIVATED:
        return 'network-vpn-symbolic';
      default:
        return 'network-vpn-disabled-symbolic';
    }
  }

  set icon_name(_ignored: string) {}
}

function isVpnConnection(connection: NM.RemoteConnection): boolean {
  const setting = connection.get_setting_connection();
  if (!setting || setting.get_master()) return false;
  return VPN_SETTING_TYPES.includes(setting.type);
}

export class NMVpnToggle extends NMToggle<NM.RemoteConnection, NMVpnConnectionItem> implements ConnectionSection {
  static {
    GObject.registerClass(this);
  }

  constructor() {
    super();

    KestrelUi.bindText(this.menu.addSettingsAction('', 'network/vpn').label, 'network-menu-vpn-settings');
    KestrelUi.localized(this, () => {
      this.menu.setHeader('network-vpn-symbolic', KestrelUi.t('network-menu-vpn'));
      this.menuButtonAccessibleName = KestrelUi.t('network-menu-vpn-open-menu');
      this.refreshLabels();
    });
  }

  setClient(client: NM.Client | null): void {
    super.setClient(client);

    this.client?.connectObject(
      'connection-added', (_client: NM.Client, connection: NM.RemoteConnection) => this.addConnection(connection),
      'connection-removed', (_client: NM.Client, connection: NM.RemoteConnection) => this.removeItem(connection),
      'notify::active-connections', () => this.syncActiveConnections(),
      this);
  }

  protected defaultName(): string {
    return KestrelUi.t('network-menu-vpn');
  }

  protected loadInitialItems(client: NM.Client): void {
    for (const connection of client.get_connections()) this.addConnection(connection);
    this.syncActiveConnections();
  }

  private syncActiveConnections(): void {
    const activeConnections = this.client!.get_active_connections().filter(c => isVpnConnection(c.connection));

    for (const item of this.items.values()) item.setActiveConnection(null);
    for (const active of activeConnections) this.items.get(active.connection)?.setActiveConnection(active);
  }

  private addConnection(connection: NM.RemoteConnection): void {
    if (this.items.has(connection)) return;
    if (!isVpnConnection(connection)) return;

    connection.connectObject('changed', () => this.items.get(connection)!.updateForConnection(connection), this);

    const item = new NMVpnConnectionItem(this, connection);
    item.connectObject('activation-failed', () => this.emit('activation-failed'), this);
    this.addItem(connection, item);

    this.syncActiveConnections();
  }

  activateConnection(connection: NM.RemoteConnection): void {
    this.client!.activate_connection_async(connection, null, null, null, null);
  }

  deactivateConnection(activeConnection: NM.ActiveConnection): void {
    this.client!.deactivate_connection(activeConnection, null);
  }
}
