import type { Operation, Source } from '#lib/bridge/types.js';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function bytes(value: number) {
	let size = value;
	let unit = 0;
	while (size >= 1000 && unit < UNITS.length - 1) {
		size /= 1000;
		unit += 1;
	}
	return `${size >= 100 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${UNITS[unit]}`;
}

const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const STEPS: [number, Intl.RelativeTimeFormatUnit][] = [
	[60, 'second'],
	[60, 'minute'],
	[24, 'hour'],
	[7, 'day'],
	[4.35, 'week'],
	[12, 'month'],
	[Infinity, 'year']
];

export function ago(seconds: number) {
	let delta = (seconds * 1000 - Date.now()) / 1000;
	if (Math.abs(delta) < 45) return 'just now';
	for (const [size, unit] of STEPS) {
		if (Math.abs(delta) < size) return RELATIVE.format(Math.round(delta), unit);
		delta /= size;
	}
	return '';
}

export const date = (seconds: number) => new Date(seconds * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

export function sourceName(source: Source, origin: string) {
	if (source === 'appImage') return 'AppImage';
	if (source === 'package') return origin || 'System package';
	return origin === 'flathub' ? 'Flathub' : origin;
}

const VERBS: Record<Operation['action'], [string, string]> = {
	install: ['Installing', 'Waiting to install'],
	remove: ['Removing', 'Waiting to remove'],
	update: ['Updating', 'Waiting to update']
};

export function activity(operation: Operation) {
	const [running, queued] = VERBS[operation.action];
	if (operation.state === 'queued') return queued;
	if (operation.progress?.stage === 'downloading') return 'Downloading';
	if (operation.progress?.stage === 'waiting') return 'Waiting';
	return running;
}

export const percent = (operation: Operation) => (operation.progress?.fraction == null ? null : Math.round(operation.progress.fraction * 100));
