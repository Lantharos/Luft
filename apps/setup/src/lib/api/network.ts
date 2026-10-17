import { invoke, listen } from '@lantharos/sabine';

export type Link = 'connected' | 'connecting' | 'disconnected' | 'unplugged';
export type Security = 'open' | 'owe' | 'wep' | 'psk' | 'sae' | 'enterprise';

export interface WifiNetwork {
	ssid: string;
	strength: number;
	security: Security;
	saved: string | null;
	joined: boolean;
	state: Link;
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
}

export interface Network {
	wifi: Wifi | null;
	wired: Wired[];
}

export interface Failure {
	path: string;
	name: string;
	reason: 'password' | 'other';
}

export const needsPassword = (security: Security) => security === 'psk' || security === 'sae' || security === 'wep';

export const open = () => invoke<Network>('network_open');
export const close = () => invoke<void>('network_close');
export const setWifi = (enabled: boolean) => invoke<void>('network_set_wifi', { enabled });
export const activate = (connection: string, device: string) => invoke<void>('network_activate', { connection, device });
export const join = (device: string, ssid: string, security: Security, password: string) =>
	invoke<void>('network_join', { device, ssid, security, password });
export const onChanged = (callback: (network: Network) => void) => listen<Network>('network.changed', callback);
export const onFailed = (callback: (failure: Failure) => void) => listen<Failure>('network.failed', callback);
