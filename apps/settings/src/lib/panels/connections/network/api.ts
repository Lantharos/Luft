import { invoke, listen } from '#lib/bridge.js';
import type { Enterprise } from './connection/profile';

export type Link = 'connected' | 'connecting' | 'disconnected' | 'unplugged';
export type Security = 'open' | 'owe' | 'wep' | 'psk' | 'sae' | 'enterprise';

export interface Details {
	ipv4: string[];
	ipv6: string[];
	gateway: string | null;
	dns: string[];
	mac: string;
}

export interface Radio {
	frequency: number;
	bssid: string;
	bitrate: number;
}

export interface WifiNetwork {
	ssid: string;
	strength: number;
	security: Security;
	saved: string | null;
	state: Link;
	details: Details | null;
	radio: Radio | null;
}

export interface Wifi {
	device: string;
	enabled: boolean;
	hardwareEnabled: boolean;
	networks: WifiNetwork[];
}

export interface Wired {
	device: string;
	connection: string | null;
	name: string;
	state: Link;
	speed: number | null;
	details: Details | null;
}

export interface Vpn {
	connection: string;
	name: string;
	active: string | null;
	state: Link;
}

export interface Known {
	connection: string;
	ssid: string;
}

export interface Airplane {
	enabled: boolean;
	hardware: boolean;
}

export interface Network {
	wifi: Wifi | null;
	known: Known[];
	wired: Wired[];
	vpns: Vpn[];
	airplane: Airplane | null;
}

export interface Failure {
	path: string;
	name: string;
	reason: 'password' | 'other';
}

export interface Join {
	device: string;
	ssid: string;
	security: Security;
	password?: string;
	hidden?: boolean;
	enterprise?: Enterprise;
}

export interface WireGuardPeer {
	publicKey: string;
	presharedKey: string;
	endpoint: string;
	allowedIps: string[];
	keepalive: number | null;
}

export interface WireGuard {
	name: string;
	privateKey: string;
	addresses: string[];
	dns: string[];
	mtu: number | null;
	listenPort: number | null;
	peers: WireGuardPeer[];
}

export interface WireGuardKeys {
	privateKey: string;
	publicKey: string;
}

const WAIT_FOR_PERSON = 300_000;

export const needsPassword = (security: Security) => security === 'psk' || security === 'sae' || security === 'wep';

export const open = () => invoke<Network>('network_open');
export const close = () => invoke<void>('network_close');
export const scan = (device: string) => invoke<void>('network_scan', { device });
export const setWifi = (enabled: boolean) => invoke<void>('network_set_wifi', { enabled });
export const setAirplane = (enabled: boolean) => invoke<void>('network_set_airplane', { enabled });
export const activate = (target: { connection?: string; device?: string }) => invoke<void>('network_activate', target);
export const deactivate = (active: string) => invoke<void>('network_deactivate', { active });
export const disconnect = (device: string) => invoke<void>('network_disconnect', { device });
export const join = (request: Join) => invoke<void>('network_join', { ...request });
export const forget = (ssid: string) => invoke<void>('network_forget', { ssid });
export const remove = (path: string) => invoke<void>('network_remove', { path }, { timeoutMs: WAIT_FOR_PERSON });
export const importVpn = () => invoke<boolean>('network_vpn_import', {}, { timeoutMs: WAIT_FOR_PERSON });
export const wireGuardKeys = () => invoke<WireGuardKeys>('network_wireguard_keys');
export const wireGuardPublicKey = (key: string) => invoke<string>('network_wireguard_public_key', { key });
export const addWireGuard = (config: WireGuard) => invoke<void>('network_wireguard_add', { ...config }, { timeoutMs: WAIT_FOR_PERSON });

export const onChanged = (callback: (network: Network) => void) => listen<Network>('network.changed', callback);
export const onFailed = (callback: (failure: Failure) => void) => listen<Failure>('network.failed', callback);
