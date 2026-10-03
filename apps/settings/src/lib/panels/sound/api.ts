import { invoke, listen } from '#lib/bridge.js';

export interface Choice {
	name: string;
	description: string;
}

export interface Device {
	index: number;
	name: string;
	description: string;
	volume: number;
	muted: boolean;
	balance: number | null;
	port: string | null;
	ports: Choice[];
}

export interface App {
	index: number;
	name: string;
	volume: number;
	muted: boolean;
	output: number;
}

export interface Card {
	index: number;
	description: string;
	profile: string | null;
	profiles: Choice[];
}

export interface Sound {
	outputs: Device[];
	inputs: Device[];
	apps: App[];
	cards: Card[];
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
export const setPort = (direction: Direction, index: number, port: string) => invoke<void>('sound_set_port', { direction, index, port });
export const setProfile = (card: number, profile: string) => invoke<void>('sound_set_profile', { card, profile });
export const moveApp = (index: number, output: number) => invoke<void>('sound_move_app', { index, output });
export const setAlertVolume = (volume: number) => invoke<void>('sound_set_alert_volume', { volume });
export const setMeter = (enabled: boolean) => invoke<void>('sound_meter', { enabled });
export const onSoundChanged = (callback: (sound: Sound) => void) => listen<Sound>('sound.changed', callback);
export const onInputLevel = (callback: (level: number) => void) => listen<number>('sound.level', callback);
