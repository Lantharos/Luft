import { settings } from '#lib/state/settings.svelte.js';

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const BIT_UNITS = ['bit/s', 'kbit/s', 'Mbit/s', 'Gbit/s', 'Tbit/s'];
const whole = new Intl.NumberFormat();
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const clock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function scaled(value: number, base: number, units: string[]) {
	let size = Math.max(0, value);
	let unit = 0;
	while (size >= 1000 && unit < units.length - 1) {
		size /= base;
		unit += 1;
	}
	const digits = unit === 0 || size >= 100 ? 0 : size >= 10 ? 1 : 2;
	return `${parseFloat(size.toFixed(digits))} ${units[unit]}`;
}

export function bytes(value: number) {
	return scaled(value, 1024, BYTE_UNITS);
}

export function rate(value: number) {
	return `${bytes(value)}/s`;
}

export function networkRate(value: number) {
	return settings.value.networkBits ? scaled(value * 8, 1000, BIT_UNITS) : rate(value);
}

export function percent(value: number | null, digits = 0) {
	return value === null ? '–' : `${Math.max(0, value).toFixed(digits)}%`;
}

export function share(part: number, total: number) {
	return total > 0 ? (part / total) * 100 : 0;
}

export function temperature(celsius: number | null) {
	if (celsius === null) return '–';
	return settings.value.temperature === 'fahrenheit' ? `${Math.round((celsius * 9) / 5 + 32)} °F` : `${Math.round(celsius)} °C`;
}

export function frequency(megahertz: number | null) {
	if (!megahertz) return '–';
	return megahertz >= 1000 ? `${(megahertz / 1000).toFixed(2)} GHz` : `${Math.round(megahertz)} MHz`;
}

export function watts(value: number | null) {
	return value === null ? '–' : `${value < 10 ? value.toFixed(1) : Math.round(value)} W`;
}

export function count(value: number) {
	return whole.format(Math.round(value));
}

export function duration(seconds: number) {
	const total = Math.max(0, Math.floor(seconds));
	const days = Math.floor(total / 86400);
	const hours = Math.floor((total % 86400) / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m ${total % 60}s`;
	return `${total}s`;
}

export function cpuTime(seconds: number) {
	const total = Math.max(0, seconds);
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const rest = (total % 60).toFixed(hours > 0 ? 0 : 1).padStart(hours > 0 ? 2 : 4, '0');
	return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

export function date(unixSeconds: number) {
	return dateTime.format(new Date(unixSeconds * 1000));
}

export function timeOfDay(unixSeconds: number) {
	return clock.format(new Date(unixSeconds * 1000));
}

export function plural(value: number, singular: string, pluralForm = `${singular}s`) {
	return `${count(value)} ${value === 1 ? singular : pluralForm}`;
}
