import { i18n } from '@luft/i18n';

export interface Option {
	value: number;
	label: string;
}

const amount = (value: number, unit: 'second' | 'minute' | 'hour' | 'day') =>
	new Intl.NumberFormat(i18n.formats, { style: 'unit', unit, unitDisplay: 'long' }).format(value);

export function duration(seconds: number) {
	if (seconds >= 3600 && seconds % 3600 === 0) return amount(seconds / 3600, 'hour');
	if (seconds >= 60 && seconds % 60 === 0) return amount(seconds / 60, 'minute');
	return amount(seconds, 'second');
}

export const days = (count: number) => amount(count, 'day');

export function including(options: Option[], value: number | undefined, label: (value: number) => string) {
	if (value === undefined || options.some((option) => option.value === value)) return options;
	return [...options, { value, label: label(value) }].sort((a, b) => (a.value < 0 ? 1 : b.value < 0 ? -1 : a.value - b.value));
}
