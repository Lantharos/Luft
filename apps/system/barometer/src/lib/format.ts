import { i18n } from '@luft/i18n';
import { bytes } from '@luft/ui';
import { settings } from '#lib/state/settings.svelte.js';

const BIT_UNITS = ['bit/s', 'kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s'];

let formattersLocale = '';
let formatters = new Map<string, Intl.NumberFormat>();

function formatter(key: string, options: Intl.NumberFormatOptions) {
	if (formattersLocale !== i18n.formats) {
		formattersLocale = i18n.formats;
		formatters = new Map();
	}
	let found = formatters.get(key);
	if (!found) {
		found = new Intl.NumberFormat(formattersLocale, options);
		formatters.set(key, found);
	}
	return found;
}

export function fixed(value: number, digits: number) {
	return formatter(`fixed:${digits}`, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

export function decimal(value: number) {
	return formatter('decimal', { maximumFractionDigits: 3 }).format(value);
}

function bits(value: number) {
	let size = value * 8;
	let unit = 0;
	while (size >= 1000 && unit < BIT_UNITS.length - 1) {
		size /= 1000;
		unit += 1;
	}
	return `${fixed(size, size >= 100 || unit === 0 ? 0 : 1)} ${BIT_UNITS[unit]}`;
}

export function rate(value: number) {
	return `${bytes(value)}/s`;
}

export function networkRate(value: number) {
	return settings.value.networkBits ? bits(value) : rate(value);
}

export function percent(value: number | null, digits = 0) {
	if (value === null) return '–';
	return formatter(`percent:${digits}`, { style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Math.max(0, value) / 100);
}

export function share(part: number, total: number) {
	return total > 0 ? (part / total) * 100 : 0;
}

export function temperature(celsius: number | null) {
	if (celsius === null) return '–';
	return settings.value.temperature === 'fahrenheit' ? `${count((celsius * 9) / 5 + 32)} °F` : `${count(celsius)} °C`;
}

export function frequency(megahertz: number | null) {
	if (!megahertz) return '–';
	return megahertz >= 1000 ? `${fixed(megahertz / 1000, 2)} GHz` : `${count(megahertz)} MHz`;
}

export function count(value: number) {
	return fixed(Math.round(value), 0);
}

export function cpuTime(seconds: number) {
	const total = Math.max(0, seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const rest = (total % 60).toFixed(hours > 0 ? 0 : 1).padStart(hours > 0 ? 2 : 4, '0');
	return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}
