import { invoke, listen } from '$lib/bridge';

export type Link = 'connected' | 'connecting' | 'disconnected' | 'unplugged';
export type Security = 'open' | 'owe' | 'wep' | 'psk' | 'sae' | 'enterprise';
export type JoinSecurity = Exclude<Security, 'enterprise'>;

export interface Details {
	ipv4: string[];
	ipv6: string[];
	gateway: string | null;
	dns: string[];
	mac: string;
}

export interface WifiNetwork {
	ssid: string;
	strength: number;
	security: Security;
	saved: string | null;
	state: Link;
	details: Details | null;
}

export interface Wifi {
	device: string;
	enabled: boolean;
	hardwareEnabled: boolean;
	networks: WifiNetwork[];
}

export interface Wired {
	device: string;
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

export interface Airplane {
	enabled: boolean;
	hardware: boolean;
}

export interface Network {
	wifi: Wifi | null;
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
	security: JoinSecurity;
	password?: string;
	hidden?: boolean;
}

export const needsPassword = (security: Security) => security === 'psk' || security === 'sae' || security === 'wep';
export const minimumPassword = (security: Security) => (security === 'wep' ? 5 : 8);

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

export const onChanged = (callback: (network: Network) => void) => listen<Network>('network.changed', callback);
export const onFailed = (callback: (failure: Failure) => void) => listen<Failure>('network.failed', callback);
