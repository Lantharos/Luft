import { invoke, listen } from '#lib/bridge.js';

export interface Mode {
	id: string;
	width: number;
	height: number;
	refresh: number;
	preferredScale: number;
	scales: number[];
	preferred: boolean;
	current: boolean;
	variable: boolean;
}

export interface Monitor {
	connector: string;
	name: string;
	builtin: boolean;
	modes: Mode[];
}

export interface LogicalMonitor {
	x: number;
	y: number;
	scale: number;
	transform: number;
	primary: boolean;
	monitors: string[];
}

export interface Displays {
	serial: number;
	monitors: Monitor[];
	logical: LogicalMonitor[];
	logicalLayout: boolean;
	globalScale: boolean;
	nightLight: boolean;
	orientationManaged: boolean;
}

export interface LogicalConfig {
	x: number;
	y: number;
	scale: number;
	transform: number;
	primary: boolean;
	monitors: { connector: string; mode: string }[];
}

export const loadDisplays = () => invoke<Displays>('display_state');
export const applyDisplays = (serial: number, logical: LogicalConfig[]) => invoke<void>('display_apply', { serial, logical });
export const onDisplaysChanged = (callback: (state: Displays) => void) => listen<Displays>('display.changed', callback);

export type BrightnessControl = { state: 'ready'; level: number } | { state: 'unresponsive' } | { state: 'unsupported' };
export type ExternalBrightness = 'checking' | 'ready' | 'missing-tool' | 'needs-restart' | 'no-access';

export interface Brightness {
	displays: Record<string, BrightnessControl>;
	external: ExternalBrightness;
}

export const loadBrightness = () => invoke<Brightness>('display_brightness');
export const setBrightness = (connector: string, level: number) => invoke<void>('display_set_brightness', { connector, level });
export const onBrightnessChanged = (callback: (brightness: Brightness) => void) => listen<Brightness>('display.brightness', callback);
