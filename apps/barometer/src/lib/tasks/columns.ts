import type { Usage } from '#lib/backend/rows.js';
import { bytes, count, cpuTime, percent, rate, timeOfDay } from '#lib/format.js';
import { monitor } from '#lib/state/monitor.svelte.js';
import { settings, type Sort } from '#lib/state/settings.svelte.js';

export interface Row extends Usage {
	name: string;
	pid?: number;
	user?: string;
	command?: string;
	started?: number;
}

export interface Column {
	id: string;
	label: string;
	width: number;
	numeric: boolean;
	value: (row: Row) => number | string;
	text: (row: Row) => string;
}

const STATES: Record<string, string> = {
	R: 'Running',
	S: 'Sleeping',
	D: 'Waiting',
	T: 'Stopped',
	t: 'Traced',
	Z: 'Zombie',
	I: 'Idle',
	X: 'Dead'
};

function processorShare(row: Row) {
	return settings.value.normalizeCpu ? row.cpu / Math.max(1, monitor.devices?.cpu.logical ?? 1) : row.cpu;
}

const quiet = (value: number, format: (value: number) => string) => (value > 0 ? format(value) : '');

export const COLUMNS: Column[] = [
	{ id: 'pid', label: 'PID', width: 76, numeric: true, value: (row) => row.pid ?? 0, text: (row) => String(row.pid ?? '') },
	{ id: 'user', label: 'User', width: 104, numeric: false, value: (row) => row.user ?? '', text: (row) => row.user ?? '' },
	{ id: 'cpu', label: 'CPU', width: 80, numeric: true, value: (row) => row.cpu, text: (row) => percent(processorShare(row), 1) },
	{ id: 'memory', label: 'Memory', width: 96, numeric: true, value: (row) => row.memory, text: (row) => bytes(row.memory) },
	{ id: 'read', label: 'Reading', width: 96, numeric: true, value: (row) => row.read, text: (row) => quiet(row.read, rate) },
	{ id: 'write', label: 'Writing', width: 96, numeric: true, value: (row) => row.write, text: (row) => quiet(row.write, rate) },
	{ id: 'readTotal', label: 'Read', width: 92, numeric: true, value: (row) => row.readTotal, text: (row) => quiet(row.readTotal, bytes) },
	{ id: 'writeTotal', label: 'Written', width: 92, numeric: true, value: (row) => row.writeTotal, text: (row) => quiet(row.writeTotal, bytes) },
	{ id: 'gpu', label: 'GPU', width: 72, numeric: true, value: (row) => row.gpu, text: (row) => quiet(row.gpu, (value) => percent(value)) },
	{ id: 'vram', label: 'Video memory', width: 112, numeric: true, value: (row) => row.vram, text: (row) => quiet(row.vram, bytes) },
	{ id: 'encoder', label: 'Encode', width: 76, numeric: true, value: (row) => row.encoder, text: (row) => quiet(row.encoder, (value) => percent(value)) },
	{ id: 'decoder', label: 'Decode', width: 76, numeric: true, value: (row) => row.decoder, text: (row) => quiet(row.decoder, (value) => percent(value)) },
	{ id: 'time', label: 'Processor time', width: 118, numeric: true, value: (row) => row.userTime + row.systemTime, text: (row) => cpuTime(row.userTime + row.systemTime) },
	{ id: 'threads', label: 'Threads', width: 76, numeric: true, value: (row) => row.threads, text: (row) => count(row.threads) },
	{ id: 'nice', label: 'Priority', width: 76, numeric: true, value: (row) => row.nice, text: (row) => String(row.nice) },
	{ id: 'state', label: 'State', width: 92, numeric: false, value: (row) => row.state, text: (row) => STATES[row.state] ?? row.state },
	{ id: 'started', label: 'Started', width: 92, numeric: true, value: (row) => row.started ?? 0, text: (row) => (row.started ? timeOfDay(row.started) : '') },
	{ id: 'command', label: 'Command', width: 280, numeric: false, value: (row) => row.command ?? '', text: (row) => row.command ?? '' }
];

export const APP_COLUMN_IDS = ['cpu', 'memory', 'read', 'write', 'readTotal', 'writeTotal', 'gpu', 'vram', 'encoder', 'decoder', 'threads'];

export function columnsFor(ids: string[]) {
	return COLUMNS.filter((column) => ids.includes(column.id));
}

export function template(columns: Column[]) {
	return ['minmax(180px, 1fr)', ...columns.map((column) => `${column.width}px`)].join(' ');
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function compare(sort: Sort) {
	const column = COLUMNS.find((candidate) => candidate.id === sort.column);
	const direction = sort.direction === 'ascending' ? 1 : -1;
	return (a: Row, b: Row) => {
		if (!column) return collator.compare(a.name, b.name) * direction;
		const left = column.value(a);
		const right = column.value(b);
		const order = typeof left === 'number' && typeof right === 'number' ? left - right : collator.compare(String(left), String(right));
		return (order || collator.compare(a.name, b.name)) * direction;
	};
}

export function toggleSort(current: Sort, column: string): Sort {
	if (current.column === column) return { column, direction: current.direction === 'ascending' ? 'descending' : 'ascending' };
	const numeric = COLUMNS.find((candidate) => candidate.id === column)?.numeric ?? false;
	return { column, direction: numeric ? 'descending' : 'ascending' };
}
