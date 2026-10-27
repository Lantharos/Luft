import type GLib from 'gi://GLib';
import NM from 'gi://NM';

import * as KestrelUi from '../../../kestrelUi.js';

export const MAX_VISIBLE_NETWORKS = 8;

export const NM80211Mode = NM['80211Mode'];

const DEVICE_KINDS = new Map<NM.DeviceType, string>([
  [NM.DeviceType.ETHERNET, 'network-device-wired'],
  [NM.DeviceType.WIFI, 'network-menu-wifi'],
  [NM.DeviceType.BT, 'network-menu-tether'],
  [NM.DeviceType.MODEM, 'network-menu-mobile'],
]);

export function signalToIcon(value: number): string {
  if (value < 20) return 'none';
  if (value < 40) return 'weak';
  if (value < 50) return 'ok';
  if (value < 80) return 'good';
  return 'excellent';
}

export function forgetUnlessJoined(activeConnection: NM.ActiveConnection): void {
  const { connection } = activeConnection;
  const settle = (): void => {
    const { state } = activeConnection;
    if (state === NM.ActiveConnectionState.ACTIVATED) {
      activeConnection.disconnect(watch);
    } else if (state === NM.ActiveConnectionState.DEACTIVATED) {
      activeConnection.disconnect(watch);
      connection.delete_async(null, null);
    }
  };
  const watch = activeConnection.connect('notify::state', settle);
  settle();
}

export function deviceKind(device: NM.Device | undefined): string {
  const id = device && DEVICE_KINDS.get(device.device_type);
  return id ? KestrelUi.t(id) : device?.get_iface() ?? '';
}

export function deviceNames(devices: NM.Device[]): string[] {
  const kinds = devices.map(deviceKind);
  return devices.map((device, i) => kinds.indexOf(kinds[i]) === kinds.lastIndexOf(kinds[i])
    ? kinds[i]
    : KestrelUi.t('network-device-named', { kind: kinds[i], name: device.get_iface() }));
}

export function connectionName(connection: NM.RemoteConnection, fallback: string): string {
  const generated = connection.get_flags() & NM.SettingsConnectionFlags.NM_GENERATED;
  return generated ? fallback : connection.get_id();
}

export function ssidToLabel(ssid: GLib.Bytes): string {
  return NM.utils_ssid_to_utf8(ssid.get_data()!) || KestrelUi.t('network-menu-unknown-network');
}

export function canReachInternet(client: NM.Client, device: NM.Device): boolean {
  if (client.primary_connection !== device.active_connection) return true;
  return client.connectivity === NM.ConnectivityState.FULL;
}
