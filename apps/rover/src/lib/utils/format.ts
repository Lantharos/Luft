const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number, decimals = 1) {
	if (bytes <= 0) return '0 B';
	const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
	return `${parseFloat((bytes / 1024 ** unit).toFixed(decimals))} ${BYTE_UNITS[unit]}`;
}

export function formatDate(timestamp: number | null) {
	if (!timestamp) return '-';
	return new Date(timestamp * 1000).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
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
