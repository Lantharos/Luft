import { i18n } from '@luft/i18n';

export interface Option {
	value: number;
	label: string;
}

export const days = (count: number) =>
	new Intl.NumberFormat(i18n.formats, { style: 'unit', unit: 'day', unitDisplay: 'long' }).format(count);

export function including(options: Option[], value: number | undefined, label: (value: number) => string) {
	if (value === undefined || options.some((option) => option.value === value)) return options;
	return [...options, { value, label: label(value) }].sort((a, b) => (a.value < 0 ? 1 : b.value < 0 ? -1 : a.value - b.value));
}
