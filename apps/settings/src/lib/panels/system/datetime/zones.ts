export interface WallTime {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
}

import { i18n } from '@luft/i18n';

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const regionNames = new Map<string, Intl.DisplayNames>();

function partsFormatter(zone: string) {
	let formatter = partsFormatters.get(zone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: zone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		});
		partsFormatters.set(zone, formatter);
	}
	return formatter;
}

export function wallTime(zone: string, epoch: number): WallTime {
	const parts = Object.fromEntries(
		partsFormatter(zone)
			.formatToParts(epoch)
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, Number(part.value)])
	);
	return { year: parts.year, month: parts.month, day: parts.day, hour: parts.hour, minute: parts.minute, second: parts.second };
}

const asUtc = ({ year, month, day, hour, minute, second }: WallTime) => Date.UTC(year, month - 1, day, hour, minute, second);

export function offsetMinutes(zone: string, epoch: number) {
	const whole = epoch - (((epoch % 1000) + 1000) % 1000);
	return Math.round((asUtc(wallTime(zone, whole)) - whole) / 60000);
}

export function toEpoch(zone: string, time: WallTime) {
	const guess = asUtc(time);
	const first = guess - offsetMinutes(zone, guess) * 60000;
	return guess - offsetMinutes(zone, first) * 60000;
}

export function offsetLabel(minutes: number) {
	if (minutes === 0) return 'UTC';
	const sign = minutes > 0 ? '+' : '-';
	const hours = Math.floor(Math.abs(minutes) / 60);
	const rest = Math.abs(minutes) % 60;
	return `UTC${sign}${hours}${rest ? `:${String(rest).padStart(2, '0')}` : ''}`;
}

export const city = (zone: string) => zone.split('/').at(-1)!.replaceAll('_', ' ');

function regions() {
	let names = regionNames.get(i18n.formats);
	if (!names) {
		names = new Intl.DisplayNames(i18n.formats, { type: 'region' });
		regionNames.set(i18n.formats, names);
	}
	return names;
}

export const country = (code: string | null) => (code ? (regions().of(code) ?? code) : null);

export function dayPeriods(locale: string) {
	const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12', timeZone: 'UTC' });
	const period = (hour: number) => format.formatToParts(Date.UTC(2023, 0, 1, hour)).find((part) => part.type === 'dayPeriod')!.value;
	return { am: period(0), pm: period(12) };
}

export function shortTime(zone: string, epoch: number, hour12: boolean) {
	const key = `${i18n.formats}|${zone}|${hour12}`;
	let formatter = timeFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(i18n.formats, { timeZone: zone, hour: 'numeric', minute: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' });
		timeFormatters.set(key, formatter);
	}
	return formatter.format(epoch);
}
