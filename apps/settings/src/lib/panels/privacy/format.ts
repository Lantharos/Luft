export interface Option {
	value: number;
	label: string;
}

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

export function duration(seconds: number) {
	if (seconds >= 3600 && seconds % 3600 === 0) return plural(seconds / 3600, 'hour');
	if (seconds >= 60 && seconds % 60 === 0) return plural(seconds / 60, 'minute');
	return plural(seconds, 'second');
}

export const days = (count: number) => plural(count, 'day');

export function including(options: Option[], value: number | undefined, label: (value: number) => string) {
	if (value === undefined || options.some((option) => option.value === value)) return options;
	return [...options, { value, label: label(value) }].sort((a, b) => (a.value < 0 ? 1 : b.value < 0 ? -1 : a.value - b.value));
}
