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
