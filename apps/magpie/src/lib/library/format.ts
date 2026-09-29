const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number) {
	if (bytes < 1000) return `${bytes} bytes`;
	const exponent = Math.min(UNITS.length - 1, Math.floor(Math.log10(bytes) / 3));
	const value = bytes / 1000 ** exponent;
	return `${value.toLocaleString(undefined, { maximumFractionDigits: value < 10 ? 1 : 0 })} ${UNITS[exponent]}`;
}

const DATE = new Intl.DateTimeFormat(undefined, { dateStyle: 'long', timeStyle: 'short' });

export function formatDate(value: string | number) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : DATE.format(date);
}

export function formatExposure(seconds: number) {
	if (seconds >= 1) return `${seconds.toLocaleString(undefined, { maximumFractionDigits: 1 })} s`;
	return `1/${Math.round(1 / seconds)} s`;
}

export function formatCoordinate(value: number, positive: string, negative: string) {
	return `${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 5 })}° ${value < 0 ? negative : positive}`;
}

export function plural(count: number, one: string, many: string) {
	return `${count.toLocaleString()} ${count === 1 ? one : many}`;
}
