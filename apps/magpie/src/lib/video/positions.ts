import type { Item } from '$lib/api';

const KEY = 'magpie.positions';
const REMEMBERED = 300;
const MINIMUM = 10;
const ENDING = 15;

type Positions = Record<string, { time: number; at: number }>;

function read(): Positions {
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Positions;
	} catch {
		return {};
	}
}

function write(positions: Positions) {
	try {
		localStorage.setItem(KEY, JSON.stringify(positions));
	} catch {
		return;
	}
}

function key(item: Item) {
	return `${item.path}\n${item.size}`;
}

export function savedPosition(item: Item) {
	return read()[key(item)]?.time ?? 0;
}

export function savePosition(item: Item, time: number, duration: number) {
	const positions = read();
	if (time < MINIMUM || time > duration - ENDING) delete positions[key(item)];
	else positions[key(item)] = { time, at: Date.now() };
	const entries = Object.entries(positions);
	if (entries.length > REMEMBERED) {
		entries.sort(([, a], [, b]) => b.at - a.at);
		return write(Object.fromEntries(entries.slice(0, REMEMBERED)));
	}
	write(positions);
}
