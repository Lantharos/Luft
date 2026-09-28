const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export function bytes(value: number) {
	let size = value;
	let unit = 0;
	while (size >= 1000 && unit < UNITS.length - 1) {
		size /= 1000;
		unit += 1;
	}
	return `${size >= 100 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${UNITS[unit]}`;
}

export function binaryBytes(value: number) {
	const gibibytes = value / 1024 ** 3;
	return `${Math.round(gibibytes)} GB`;
}

export const percent = (value: number) => `${Math.round(value * 100)}%`;
