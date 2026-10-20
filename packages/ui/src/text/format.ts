import { i18n, t } from '@luft/i18n';

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];
const RELATIVE_STEPS: [number, Intl.RelativeTimeFormatUnit][] = [
	[60, 'second'],
	[60, 'minute'],
	[24, 'hour'],
	[7, 'day'],
	[4.35, 'week'],
	[12, 'month'],
	[Infinity, 'year']
];

let formattersLocale = '';
let numberFormatters = new Map<string, Intl.NumberFormat>();
let relative: Intl.RelativeTimeFormat | null = null;

function currentLocale() {
	if (formattersLocale !== i18n.formats) {
		formattersLocale = i18n.formats;
		numberFormatters = new Map();
		relative = null;
	}
	return formattersLocale;
}

function numberFormatter(fractionDigits: number, unit?: string) {
	const locale = currentLocale();
	const key = `${unit ?? ''}:${fractionDigits}`;
	let formatter = numberFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.NumberFormat(locale, { style: unit ? 'unit' : 'decimal', unit, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
		numberFormatters.set(key, formatter);
	}
	return formatter;
}

function scaled(value: number, base: number) {
	let size = value;
	let unit = 0;
	while (size >= 1000 && unit < BYTE_UNITS.length - 1) {
		size /= base;
		unit += 1;
	}
	return numberFormatter(size >= 100 || unit === 0 ? 0 : 1, BYTE_UNITS[unit]).format(size);
}

export function bytes(value: number) {
	return scaled(value, 1000);
}

export function memoryBytes(value: number) {
	return scaled(value, 1024);
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
	return `${numberFormatter(0).format(count)} ${count === 1 ? singular : pluralForm}`;
}

export function ago(unixSeconds: number) {
	let delta = unixSeconds - Date.now() / 1000;
	if (Math.abs(delta) < 45) return t('ui-time-just-now');
	const locale = currentLocale();
	relative ??= new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	for (const [size, unit] of RELATIVE_STEPS) {
		if (Math.abs(delta) < size) return relative.format(Math.round(delta), unit);
		delta /= size;
	}
	return '';
}

export function watts(value: number) {
	return t('ui-power-watts', { watts: numberFormatter(value < 10 ? 1 : 0).format(value) });
}
