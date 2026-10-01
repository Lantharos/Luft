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
const RECENT_DAYS = 7;

export function ago(seconds: number) {
	let delta = seconds - Date.now() / 1000;
	if (Math.abs(delta) < 45) return 'just now';
	for (const [size, unit] of STEPS) {
		if (Math.abs(delta) < size) return RELATIVE.format(Math.round(delta), unit);
		delta /= size;
	}
	return '';
}

export const recently = (seconds: number) => Date.now() / 1000 - seconds < RECENT_DAYS * 24 * 60 * 60;
