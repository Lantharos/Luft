import { invoke, listen } from '$lib/bridge';

export interface Device {
	index: number;
	name: string;
	description: string;
	volume: number;
	muted: boolean;
	balance: number | null;
}

export interface App {
	index: number;
	name: string;
	volume: number;
	muted: boolean;
}

export interface Sound {
	outputs: Device[];
	inputs: Device[];
	apps: App[];
	defaultOutput: string;
	defaultInput: string;
	alertVolume: number | null;
}

export type Direction = 'output' | 'input';
export type Target = Direction | 'app';

export const startSound = () => invoke<void>('sound_start');
export const setDefault = (direction: Direction, name: string) => invoke<void>('sound_set_default', { direction, name });
export const setVolume = (target: Target, index: number, volume: number) => invoke<void>('sound_set_volume', { target, index, volume });
export const setMute = (target: Target, index: number, muted: boolean) => invoke<void>('sound_set_mute', { target, index, muted });
export const setBalance = (index: number, balance: number) => invoke<void>('sound_set_balance', { index, balance });
export const setAlertVolume = (volume: number) => invoke<void>('sound_set_alert_volume', { volume });
export const setMeter = (enabled: boolean) => invoke<void>('sound_meter', { enabled });
export const onSoundChanged = (callback: (sound: Sound) => void) => listen<Sound>('sound.changed', callback);
export const onInputLevel = (callback: (level: number) => void) => listen<number>('sound.level', callback);
