import { commands, type Making, type Source } from '#lib/bindings.js';
import { call, start } from '#lib/bridge/meet.js';

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

export const sticks = (iso: string | null) => call<Sticks>({ call: 'sticks', iso });
export const room = (stick: string, needed: number) => call<Room>({ call: 'ventoyRoom', stick, needed });
export const offer = (source: Source) => start<Offer>((job) => commands.meetStickOffer({ job, request: { source } }));
export const make = (making: Making) => start<Finished>((job) => commands.meetMakeStick({ job, request: making }));
