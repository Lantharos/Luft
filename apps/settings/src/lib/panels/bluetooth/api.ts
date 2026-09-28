import { invoke, listen } from '$lib/bridge';

export type Kind =
	| 'headphones'
	| 'speaker'
	| 'mouse'
	| 'keyboard'
	| 'gamepad'
	| 'phone'
	| 'computer'
	| 'tablet'
	| 'display'
	| 'printer'
	| 'camera'
	| 'other';

export interface Adapter {
	path: string;
	powered: boolean;
	blocked: boolean;
	discovering: boolean;
	discoverable: boolean;
	discoverableTimeout: number;
	name: string;
}

export interface Device {
	path: string;
	name: string;
	address: string;
	kind: Kind;
	connected: boolean;
	trusted: boolean;
	battery: number | null;
}

export interface Bluetooth {
	adapter: Adapter | null;
	hardwareBlocked: boolean;
	paired: Device[];
	nearby: Device[];
}

export interface PairingRequest {
	id: number;
	device: string;
	name: string;
	kind: 'confirm' | 'authorize' | 'pin' | 'passkey' | 'display';
	code: string | null;
}

const PAIRING_TIMEOUT = 120_000;

export const open = () => invoke<Bluetooth>('bluetooth_open');
export const close = () => invoke<void>('bluetooth_close');
export const setPowered = (enabled: boolean) => invoke<void>('bluetooth_set_powered', { enabled });
export const connect = (device: string) => invoke<void>('bluetooth_connect', { device });
export const disconnect = (device: string) => invoke<void>('bluetooth_disconnect', { device });
export const pair = (device: string) => invoke<void>('bluetooth_pair', { device }, { timeoutMs: PAIRING_TIMEOUT });
export const cancelPairing = (device: string) => invoke<void>('bluetooth_cancel_pairing', { device });
export const forget = (device: string) => invoke<void>('bluetooth_forget', { device });
export const setTrusted = (device: string, trusted: boolean) => invoke<void>('bluetooth_set_trusted', { device, trusted });
export const setVisible = (visible: boolean, timeout: number) => invoke<void>('bluetooth_set_visible', { visible, timeout });
export const answer = (id: number, value: string | null) => invoke<void>('bluetooth_answer', { id, value });

export const onChanged = (callback: (bluetooth: Bluetooth) => void) => listen<Bluetooth>('bluetooth.changed', callback);
export const onRequest = (callback: (request: PairingRequest) => void) => listen<PairingRequest>('bluetooth.request', callback);
export const onCancel = (callback: () => void) => listen<null>('bluetooth.cancel', callback);
