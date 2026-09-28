const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number, decimals = 1) {
	if (bytes <= 0) return '0 B';
	const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
	return `${parseFloat((bytes / 1024 ** unit).toFixed(decimals))} ${BYTE_UNITS[unit]}`;
}

const DAY_MS = 86_400_000;
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayInYear = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const dayWithYear = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(timestamp: number | null) {
	if (!timestamp) return '';
	const date = new Date(timestamp * 1000);
	const today = new Date().setHours(0, 0, 0, 0);
	if (date.getTime() >= today) return `Today, ${time.format(date)}`;
	if (date.getTime() >= today - DAY_MS) return `Yesterday, ${time.format(date)}`;
	return (date.getFullYear() === new Date().getFullYear() ? dayInYear : dayWithYear).format(date);
}

export function formatFullDate(timestamp: number | null) {
	return timestamp ? fullDate.format(new Date(timestamp * 1000)) : '';
}

export function formatClock(seconds: number) {
	const whole = Math.round(seconds);
	const hours = Math.floor(whole / 3600);
	const minutes = Math.floor((whole % 3600) / 60);
	const rest = String(whole % 60).padStart(2, '0');
	return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

export function formatDuration(seconds: number) {
	const rounded = Math.max(1, Math.round(seconds));
	const minutes = Math.floor(rounded / 60);
	if (minutes < 1) return `${rounded}s`;
	const hours = Math.floor(minutes / 60);
	if (hours < 1) return `${minutes}m ${rounded % 60}s`;
	return `${hours}h ${minutes % 60}m`;
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
	return `${count} ${count === 1 ? singular : pluralForm}`;
}

export function errorMessage(caught: unknown) {
	return caught instanceof Error ? caught.message : String(caught);
}
