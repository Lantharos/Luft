const DAY = 24 * 60 * 60 * 1000;

const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
const monthDay = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const fullDate = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const long = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function startOfDay(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function shortDate(seconds: number) {
	const date = new Date(seconds * 1000);
	const now = new Date();
	const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY);
	if (days <= 0) return time.format(date);
	if (days < 7) return weekday.format(date);
	if (date.getFullYear() === now.getFullYear()) return monthDay.format(date);
	return fullDate.format(date);
}

export function longDate(seconds: number) {
	return long.format(new Date(seconds * 1000));
}

export function until(seconds: number) {
	const difference = seconds * 1000 - Date.now();
	const hours = Math.round(difference / (60 * 60 * 1000));
	if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
	return relative.format(Math.round(difference / DAY), 'day');
}

export function size(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function displayName(name: string, address: string) {
	return name.trim() || address;
}

export function plural(count: number, one: string, many: string) {
	return `${count} ${count === 1 ? one : many}`;
}
