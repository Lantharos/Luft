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

const DAY_MS = 86_400_000;
const DATE_STYLES = {
	date: { dateStyle: 'long' },
	dateTime: { dateStyle: 'medium', timeStyle: 'short' },
	longDateTime: { dateStyle: 'full', timeStyle: 'short' },
	time: { timeStyle: 'short' },
	weekday: { weekday: 'short' },
	weekdayTime: { weekday: 'short', hour: 'numeric', minute: '2-digit' },
	month: { month: 'long' },
	monthDay: { month: 'short', day: 'numeric' },
	shortDate: { dateStyle: 'medium' }
} satisfies Record<string, Intl.DateTimeFormatOptions>;

let formattersLocale = '';
let numberFormatters = new Map<string, Intl.NumberFormat>();
let dateFormatters = new Map<keyof typeof DATE_STYLES, Intl.DateTimeFormat>();
let durationFormatters = new Map<Intl.DurationFormatOptions['style'], Intl.DurationFormat>();
let relative: Intl.RelativeTimeFormat | null = null;

function currentLocale() {
	if (formattersLocale !== i18n.formats) {
		formattersLocale = i18n.formats;
		numberFormatters = new Map();
		dateFormatters = new Map();
		durationFormatters = new Map();
		relative = null;
	}
	return formattersLocale;
}

function formatDate(style: keyof typeof DATE_STYLES, unixSeconds: number) {
	const locale = currentLocale();
	let formatter = dateFormatters.get(style);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, DATE_STYLES[style]);
		dateFormatters.set(style, formatter);
	}
	return formatter.format(unixSeconds * 1000);
}

function formatDuration(style: Intl.DurationFormatOptions['style'], seconds: number) {
	const locale = currentLocale();
	let formatter = durationFormatters.get(style);
	if (!formatter) {
		formatter = new Intl.DurationFormat(locale, { style });
		durationFormatters.set(style, formatter);
	}
	const total = Math.max(0, Math.round(seconds));
	const parts: [Intl.DurationFormatUnit, number][] = [
		['days', Math.floor(total / 86400)],
		['hours', Math.floor((total % 86400) / 3600)],
		['minutes', Math.floor((total % 3600) / 60)],
		['seconds', total % 60]
	];
	const first = Math.max(0, parts.findIndex(([, value]) => value > 0));
	const shown = parts.slice(first, first + 2).filter(([, value], index) => index === 0 || value > 0);
	return formatter.format(Object.fromEntries(shown));
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

export const date = (unixSeconds: number) => formatDate('date', unixSeconds);
export const dateTime = (unixSeconds: number) => formatDate('dateTime', unixSeconds);
export const longDateTime = (unixSeconds: number) => formatDate('longDateTime', unixSeconds);
export const time = (unixSeconds: number) => formatDate('time', unixSeconds);
export const weekdayTime = (unixSeconds: number) => formatDate('weekdayTime', unixSeconds);
export const month = (unixSeconds: number) => formatDate('month', unixSeconds);

export function relativeDay(unixSeconds: number) {
	const now = new Date();
	const then = new Date(unixSeconds * 1000);
	const days = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(then).setHours(0, 0, 0, 0)) / DAY_MS);
	if (days <= 0) return time(unixSeconds);
	if (days < 7) return formatDate('weekday', unixSeconds);
	return formatDate(then.getFullYear() === now.getFullYear() ? 'monthDay' : 'shortDate', unixSeconds);
}

export const duration = (seconds: number) => formatDuration('narrow', seconds);
export const longDuration = (seconds: number) => formatDuration('long', seconds);
