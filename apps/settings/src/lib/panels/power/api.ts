import { invoke, listen } from '$lib/bridge';

export type Charge = 'charging' | 'discharging' | 'empty' | 'full' | 'not-charging';
export type DeviceKind = 'mouse' | 'keyboard' | 'headphones' | 'speaker' | 'gamepad' | 'phone' | 'tablet' | 'pen' | 'touchpad' | 'other';

export interface Battery {
	level: number;
	charge: Charge;
	untilFull: number;
	untilEmpty: number;
	health: number | null;
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
	degraded: string | null;
}

export interface PowerState {
	battery: Battery | null;
	devices: Device[];
	profiles: Profiles | null;
	canHibernate: boolean;
}

export const powerState = () => invoke<PowerState>('power_state');
export const setProfile = (profile: string) => invoke<void>('power_set_profile', { profile });
export const onPowerChanged = (callback: (state: PowerState) => void) => listen<PowerState>('power.changed', callback);
