import { invoke, listen } from '$lib/bridge';

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
