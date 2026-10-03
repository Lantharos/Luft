const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const RELATIVE = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
const RELATIVE_STEPS: [number, Intl.RelativeTimeFormatUnit][] = [
	[60, 'second'],
	[60, 'minute'],
	[24, 'hour'],
	[7, 'day'],
	[4.35, 'week'],
	[12, 'month'],
	[Infinity, 'year']
];
const whole = new Intl.NumberFormat();

function scaled(value: number, base: number) {
	let size = value;
	let unit = 0;
	while (size >= 1000 && unit < BYTE_UNITS.length - 1) {
		size /= base;
		unit += 1;
	}
	return `${size >= 100 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${BYTE_UNITS[unit]}`;
}

export function bytes(value: number) {
	return scaled(value, 1000);
}

export function memoryBytes(value: number) {
	return scaled(value, 1024);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
	return `${whole.format(count)} ${count === 1 ? singular : pluralForm}`;
}

export function ago(unixSeconds: number) {
	let delta = unixSeconds - Date.now() / 1000;
	if (Math.abs(delta) < 45) return 'just now';
	for (const [size, unit] of RELATIVE_STEPS) {
		if (Math.abs(delta) < size) return RELATIVE.format(Math.round(delta), unit);
		delta /= size;
	}
	return '';
}

export function watts(value: number) {
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} W`;
}
