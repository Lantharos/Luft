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

export function formatDuration(seconds: number) {
	const rounded = Math.max(1, Math.round(seconds));
	const minutes = Math.floor(rounded / 60);
	if (minutes < 1) return `${rounded}s`;
	const hours = Math.floor(minutes / 60);
	if (hours < 1) return `${minutes}m ${rounded % 60}s`;
	return `${hours}h ${minutes % 60}m`;
}

export function errorMessage(caught: unknown) {
	return caught instanceof Error ? caught.message : String(caught);
}
