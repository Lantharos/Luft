import { invoke, listen } from '#lib/bridge.js';

export type Charge = 'charging' | 'discharging' | 'empty' | 'full' | 'not-charging';
export type DeviceKind = 'mouse' | 'keyboard' | 'headphones' | 'speaker' | 'gamepad' | 'phone' | 'tablet' | 'pen' | 'touchpad' | 'other';

export interface Capacity {
	full: number;
	design: number;
}

export interface ChargeLimit {
	adjustable: boolean;
	enabled: boolean;
	stopsAt: number | null;
	applied: number | null;
	elsewhere: boolean;
}

export interface Battery {
	level: number;
	charge: Charge;
	untilFull: number;
	untilEmpty: number;
	rate: number | null;
	capacity: Capacity | null;
	cycles: number[];
	limit: ChargeLimit | null;
}

export interface Keyboard {
	id: string;
	level: number;
	max: number;
}

export interface Device {
	id: string;
	name: string | null;
	kind: DeviceKind;
	level: number;
	charging: boolean;
}

export interface Profiles {
	active: string;
	available: string[];
	degraded: string[];
}

export interface PowerState {
	battery: Battery | null;
	devices: Device[];
	keyboard: Keyboard | null;
	profiles: Profiles | null;
	canHibernate: boolean;
}

export const powerState = () => invoke<PowerState>('power_state');
export const setProfile = (profile: string) => invoke<void>('power_set_profile', { profile });
export const setChargeLimit = (enabled: boolean) => invoke<void>('power_set_charge_limit', { enabled });
export const setKeyboard = (id: string, level: number) => invoke<void>('power_set_keyboard', { id, level });
export const onPowerChanged = (callback: (state: PowerState) => void) => listen<PowerState>('power.changed', callback);
