import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import NM from 'gi://NM';
import Polkit from 'gi://Polkit';
import St from 'gi://St';

import * as KestrelUi from '../../../kestrelUi.js';
import * as PopupMenu from '../../popups/popupMenu.js';
import * as Util from '../../runtime/util.js';
import { registerDestroyableType } from '../../runtime/signalTracker.js';
import { forgetUnlessJoined, NM80211Mode, signalToIcon } from './nmUtils.js';

Gio._promisify(NM.Client.prototype, 'add_and_activate_connection_async');

const SECURITY_TYPES = (Object.values(NM.UtilsSecurityType) as NM.UtilsSecurityType[]).sort((a, b) => b - a);

const OPEN_SECURITY_TYPES = [NM.UtilsSecurityType.NONE, NM.UtilsSecurityType.OWE];

const ENTERPRISE_SECURITY_TYPES = [NM.UtilsSecurityType.WPA_ENTERPRISE, NM.UtilsSecurityType.WPA2_ENTERPRISE];

export namespace WirelessNetwork {
  export interface Signals extends GObject.Object.SignalSignatures {
    'destroy': () => void;
  }
}

export class WirelessNetwork extends GObject.Object {
  static {
    GObject.registerClass({
      Properties: {
        'name': GObject.ParamSpec.string('name', null, null, GObject.ParamFlags.READABLE, ''),
        'icon-name': GObject.ParamSpec.string('icon-name', null, null, GObject.ParamFlags.READABLE, ''),
        'secure': GObject.ParamSpec.boolean('secure', null, null, GObject.ParamFlags.READABLE, false),
        'is-active': GObject.ParamSpec.boolean('is-active', null, null, GObject.ParamFlags.READABLE, false),
        'signal-strength': GObject.ParamSpec.uint('signal-strength', null, null, GObject.ParamFlags.READABLE, 0, GLib.MAXUINT32, 0),
      },
      Signals: {
        'destroy': {},
      },
    }, this);
  }

  declare connect: GObject.SignalMethods<this, WirelessNetwork.Signals>['connect'];
  declare emit: GObject.SignalMethods<this, WirelessNetwork.Signals>['emit'];

  private readonly accessPoints = new Set<NM.AccessPoint>();
  private connections: NM.RemoteConnection[] = [];
  private nameValue = '';
  private ssid: GLib.Bytes | null = null;
  private bestAp: NM.AccessPoint | undefined = undefined;
  private mode = 0;
  private securityType = NM.UtilsSecurityType.NONE;

  constructor(private readonly device: NM.DeviceWifi) {
    super();

    this.device.connectObject(
      'notify::active-access-point', () => this.notify('is-active'),
      'notify::active-connection', () => this.notify('is-active'),
      this);
  }

  get signal_strength(): number {
    return this.bestAp?.strength ?? 0;
  }

  get name(): string {
    return this.nameValue;
  }

  get icon_name(): string {
    if (this.mode === NM80211Mode.ADHOC) return 'network-workgroup-symbolic';
    if (!this.bestAp) return '';
    return `network-wireless-signal-${signalToIcon(this.bestAp.strength)}-symbolic`;
  }

  get secure(): boolean {
    return !OPEN_SECURITY_TYPES.includes(this.securityType);
  }

  get is_active(): boolean {
    if (this.accessPoints.has(this.device.activeAccessPoint)) return true;

    const { activeConnection } = this.device;
    if (activeConnection) return this.connections.includes(activeConnection.connection);

    return false;
  }

  hasAccessPoints(): boolean {
    return this.accessPoints.size > 0;
  }

  checkAccessPoint(ap: NM.AccessPoint): boolean {
    if (!ap.get_ssid()) return false;

    const secType = this.apSecurityType(ap);
    if (secType === NM.UtilsSecurityType.INVALID) return false;

    if (this.accessPoints.size === 0) return true;

    return this.ssid!.equal(ap.ssid) && this.mode === ap.mode && this.securityType === secType;
  }

  addAccessPoint(ap: NM.AccessPoint): boolean {
    if (!this.checkAccessPoint(ap)) return false;

    if (this.accessPoints.size === 0) {
      this.ssid = ap.get_ssid();
      this.mode = ap.mode;
      this.securityType = this.apSecurityType(ap);
      this.nameValue = NM.utils_ssid_to_utf8(this.ssid.get_data()!) || '<unknown>';

      this.notify('name');
      this.notify('secure');
    }

    const wasActive = this.is_active;
    this.accessPoints.add(ap);

    ap.connectObject('notify::strength', () => {
      this.notify('icon-name');
      this.notify('signal-strength');
      this.updateBestAp();
    }, this);
    this.updateBestAp();

    if (wasActive !== this.is_active) this.notify('is-active');

    return true;
  }

  removeAccessPoint(ap: NM.AccessPoint): boolean {
    const wasActive = this.is_active;
    if (!this.accessPoints.delete(ap)) return false;

    ap.disconnectObject(this);
    this.updateBestAp();

    if (wasActive !== this.is_active) this.notify('is-active');

    return true;
  }

  compare(other: WirelessNetwork): number {
    const cmpConnections = Number(other.hasConnections()) - Number(this.hasConnections());
    if (cmpConnections !== 0) return cmpConnections;

    const cmpAps = Number(other.hasAccessPoints()) - Number(this.hasAccessPoints());
    if (cmpAps !== 0) return cmpAps;

    const cmpStrength = other.signal_strength - this.signal_strength;
    if (cmpStrength !== 0) return cmpStrength;

    const cmpSec = Number(other.secure) - Number(this.secure);
    if (cmpSec !== 0) return cmpSec;

    return GLib.utf8_collate(this.nameValue, other.nameValue);
  }

  hasConnections(): boolean {
    return this.connections.length > 0;
  }

  checkConnections(connections: NM.RemoteConnection[]): void {
    const aps = [...this.accessPoints];
    this.connections = connections.filter(c => aps.some(ap => ap.connection_valid(c)));
  }

  canAutoconnect(): boolean {
    return !ENTERPRISE_SECURITY_TYPES.includes(this.securityType);
  }

  activate(): void {
    const [ap] = this.accessPoints;
    const [conn] = this.connections;
    if (conn) {
      this.device.client.activate_connection_async(conn, this.device, null, null, null);
    } else if (!this.canAutoconnect()) {
      Util.openSettings('network');
    } else {
      const connection = new NM.SimpleConnection();
      const permission = Polkit.Permission.new_sync('org.freedesktop.NetworkManager.settings.modify.system', null, null);
      if (!permission?.get_allowed()) {
        const setting = new NM.SettingConnection();
        setting.add_permission('user', GLib.get_user_name(), null);
        connection.add_setting(setting);
      }
      this.join(connection, ap);
    }
  }

  private async join(connection: NM.SimpleConnection, ap: NM.AccessPoint): Promise<void> {
    try {
      const activeConnection = await this.device.client.add_and_activate_connection_async(connection, this.device, ap.get_path(), null);
      forgetUnlessJoined(activeConnection);
    } catch (e) {
      console.warn(`Couldn't join ${this.nameValue}: ${(e as Error).message}`);
    }
  }

  destroy(): void {
    this.emit('destroy');
  }

  private apSecurityType(ap: NM.AccessPoint): NM.UtilsSecurityType {
    const caps = this.device.wirelessCapabilities;
    const { flags, wpaFlags, rsnFlags } = ap;
    const adHoc = ap.mode === NM80211Mode.ADHOC;
    const bestType = SECURITY_TYPES.find(t => NM.utils_security_valid(t, caps, true, adHoc, flags, wpaFlags, rsnFlags));
    return bestType ?? NM.UtilsSecurityType.INVALID;
  }

  private updateBestAp(): void {
    const [bestAp] = [...this.accessPoints].sort((a, b) => b.strength - a.strength);
    if (this.bestAp === bestAp) return;

    this.bestAp = bestAp;
    this.notify('icon-name');
  }
}
registerDestroyableType(WirelessNetwork);

export class NMWirelessNetworkItem extends PopupMenu.PopupBaseMenuItem {
  static {
    GObject.registerClass(this);
  }

  private readonly label: St.Label;

  constructor(readonly network: WirelessNetwork) {
    super({ style_class: 'nm-network-item' });

    const icons = new St.Widget({
      style_class: 'wireless-icons',
      layout_manager: new Clutter.BinLayout(),
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.add_child(icons);

    const signalIcon = new St.Icon({ style_class: 'popup-menu-icon', x_expand: true, x_align: Clutter.ActorAlign.START });
    icons.add_child(signalIcon);

    const secureIcon = new St.Icon({
      style_class: 'wireless-secure-icon',
      x_expand: true,
      y_expand: true,
      x_align: Clutter.ActorAlign.END,
      y_align: Clutter.ActorAlign.END,
    });
    icons.add_child(secureIcon);

    this.label = new St.Label();
    this.add_child(this.label);

    const selectedIcon = new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'object-select-symbolic' });
    this.add_child(selectedIcon);

    this.network.bind_property('icon-name', signalIcon, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
    this.network.bind_property('name', this.label, 'text', GObject.BindingFlags.SYNC_CREATE);
    this.network.bind_property('is-active', selectedIcon, 'visible', GObject.BindingFlags.SYNC_CREATE);
    this.network.bind_property_full('secure', secureIcon, 'icon-name', GObject.BindingFlags.SYNC_CREATE,
      (_binding, secure: boolean) => [true, secure ? 'network-wireless-encrypted-symbolic' : ''], null);
    this.network.connectObject(
      'notify::is-active', () => this.isActiveChanged(),
      'notify::secure', () => this.updateAccessibleName(),
      'notify::signal-strength', () => this.updateAccessibleName(),
      this);
    KestrelUi.localized(this, () => this.updateAccessibleName());
  }

  private isActiveChanged(): void {
    if (this.network.is_active) this.add_accessible_state(Atk.StateType.CHECKED);
    else this.remove_accessible_state(Atk.StateType.CHECKED);
  }

  private updateAccessibleName(): void {
    this.accessible_name = KestrelUi.t('network-menu-wifi-network', {
      name: this.label.text,
      secure: this.network.secure ? 'yes' : 'no',
      strength: this.network.signal_strength,
    });
  }
}
