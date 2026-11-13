import type { Stats } from '../../../store';

export type Day = Stats['days'][number];

const DAY_MS = 86_400_000;

/** A rounded top for the chart, with room for four even steps. */
export function niceMax(value: number) {
	if (value <= 0) return 1;
	const power = 10 ** Math.floor(Math.log10(value));
	const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * power >= value / 4)! * power;
	return Math.ceil(value / step) * step;
}

export function ticks(max: number, count = 4) {
	return Array.from({ length: count + 1 }, (_, index) => (max / count) * index);
}

/** Every one of the last `count` days, with nothing on the days the store has no row for. */
export function everyDay(days: Day[], count: number): Day[] {
	const known = new Map(days.map((day) => [day.day, day]));
	const today = Math.floor(Date.now() / DAY_MS);
	return Array.from({ length: count }, (_, index) => {
		const day = new Date((today - count + 1 + index) * DAY_MS).toISOString().slice(0, 10);
		return known.get(day) ?? { day, installs: 0, updates: 0 };
	});
}

export function path(points: [number, number][]) {
	return points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
}
