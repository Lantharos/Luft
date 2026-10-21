import { call, start, type Source } from '#lib/bridge/meet.js';

export type Way = { kind: 'erase' } | { kind: 'ventoy'; replace: boolean };

export interface Volume {
	label: string | null;
	filesystem: string | null;
	size: number;
}

export interface Stick {
	id: string;
	name: string;
	size: number;
	volumes: Volume[];
	ventoy: boolean;
}

export interface Sticks {
	sticks: Stick[];
}

export interface Offer {
	name: string;
	size: number;
	kept: boolean;
}

export interface Older {
	name: string;
	size: number;
}

export type Fit = 'beside' | 'replacing' | 'no';

export interface Room {
	free: number;
	older: Older[];
	fit: Fit;
}

export interface Finished {
	ejected: boolean;
}

export interface Making {
	source: Source;
	stick: string;
	way: Way;
}

export const sticks = (iso: string | null) => call<Sticks>({ call: 'sticks', iso });
export const room = (stick: string, needed: number) => call<Room>({ call: 'ventoyRoom', stick, needed });
export const offer = (source: Source) => start<Offer>('meet_stick_offer', { source });
export const make = (making: Making) => start<Finished>('meet_make_stick', making);
