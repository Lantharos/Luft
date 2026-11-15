import { resolved, t } from '@luft/i18n';
import { bytes, memoryBytes, time } from '@luft/ui';
import type { Usage } from '#lib/bridge/rows.js';
import { count, cpuTime, percent, rate } from '#lib/format.js';
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

const states = resolved(
	(): Record<string, string> => ({
		R: t('barometer-state-running'),
		S: t('barometer-state-sleeping'),
		D: t('barometer-state-waiting'),
		T: t('barometer-state-stopped'),
		t: t('barometer-state-traced'),
		Z: t('barometer-state-zombie'),
		I: t('barometer-state-idle'),
		X: t('barometer-state-dead')
	})
);

function processorShare(row: Row) {
	return settings.value.normalizeCpu ? row.cpu / Math.max(1, monitor.devices?.cpu.logical ?? 1) : row.cpu;
}

const quiet = (value: number, format: (value: number) => string) => (value > 0 ? format(value) : '');

export const allColumns = resolved((): Column[] => [
	{ id: 'pid', label: t('barometer-column-pid'), width: 76, numeric: true, value: (row) => row.pid ?? 0, text: (row) => String(row.pid ?? '') },
	{ id: 'user', label: t('barometer-column-user'), width: 104, numeric: false, value: (row) => row.user ?? '', text: (row) => row.user ?? '' },
	{ id: 'cpu', label: t('barometer-column-cpu'), width: 80, numeric: true, value: (row) => row.cpu, text: (row) => percent(processorShare(row), 1) },
	{ id: 'memory', label: t('barometer-column-memory'), width: 96, numeric: true, value: (row) => row.memory, text: (row) => memoryBytes(row.memory) },
	{ id: 'read', label: t('barometer-column-read'), width: 96, numeric: true, value: (row) => row.read, text: (row) => quiet(row.read, rate) },
	{ id: 'write', label: t('barometer-column-write'), width: 96, numeric: true, value: (row) => row.write, text: (row) => quiet(row.write, rate) },
	{ id: 'readTotal', label: t('barometer-column-read-total'), width: 92, numeric: true, value: (row) => row.readTotal, text: (row) => quiet(row.readTotal, bytes) },
	{ id: 'writeTotal', label: t('barometer-column-write-total'), width: 92, numeric: true, value: (row) => row.writeTotal, text: (row) => quiet(row.writeTotal, bytes) },
	{ id: 'gpu', label: t('barometer-column-gpu'), width: 72, numeric: true, value: (row) => row.gpu, text: (row) => quiet(row.gpu, (value) => percent(value)) },
	{ id: 'vram', label: t('barometer-column-vram'), width: 112, numeric: true, value: (row) => row.vram, text: (row) => quiet(row.vram, memoryBytes) },
	{ id: 'encoder', label: t('barometer-column-encoder'), width: 76, numeric: true, value: (row) => row.encoder, text: (row) => quiet(row.encoder, (value) => percent(value)) },
	{ id: 'decoder', label: t('barometer-column-decoder'), width: 76, numeric: true, value: (row) => row.decoder, text: (row) => quiet(row.decoder, (value) => percent(value)) },
	{ id: 'time', label: t('barometer-column-time'), width: 118, numeric: true, value: (row) => row.userTime + row.systemTime, text: (row) => cpuTime(row.userTime + row.systemTime) },
	{ id: 'threads', label: t('barometer-column-threads'), width: 76, numeric: true, value: (row) => row.threads, text: (row) => count(row.threads) },
	{ id: 'nice', label: t('barometer-column-nice'), width: 76, numeric: true, value: (row) => row.nice, text: (row) => String(row.nice) },
	{ id: 'state', label: t('barometer-column-state'), width: 92, numeric: false, value: (row) => row.state, text: (row) => states()[row.state] ?? row.state },
	{ id: 'started', label: t('barometer-column-started'), width: 92, numeric: true, value: (row) => row.started ?? 0, text: (row) => (row.started ? time(row.started) : '') },
	{ id: 'command', label: t('barometer-column-command'), width: 280, numeric: false, value: (row) => row.command ?? '', text: (row) => row.command ?? '' }
]);

const GROUP_COLUMNS = new Set(['cpu', 'memory', 'read', 'write', 'readTotal', 'writeTotal', 'gpu', 'vram', 'encoder', 'decoder', 'threads']);

export const sharedByGroups = (column: Column) => GROUP_COLUMNS.has(column.id);

export function columnsFor(ids: string[]) {
	return allColumns().filter((column) => ids.includes(column.id));
}

export function template(columns: Column[]) {
	return ['minmax(180px, 1fr)', ...columns.map((column) => `${column.width}px`)].join(' ');
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export function compare(sort: Sort) {
	const column = allColumns().find((candidate) => candidate.id === sort.column);
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
	const numeric = allColumns().find((candidate) => candidate.id === column)?.numeric ?? false;
	return { column, direction: numeric ? 'descending' : 'ascending' };
}
