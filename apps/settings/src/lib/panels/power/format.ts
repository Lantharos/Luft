const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

export function duration(seconds: number) {
	const minutes = Math.round(seconds / 60);
	if (minutes < 1) return 'less than a minute';
	if (minutes < 60) return plural(minutes, 'minute');
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${plural(hours, 'hour')} ${plural(rest, 'minute')}` : plural(hours, 'hour');
}

export function durationOptions(seconds: number[], current: number) {
	const values = seconds.includes(current) || current === 0 ? seconds : [...seconds, current].sort((left, right) => left - right);
	return [...values.map((value) => ({ value, label: duration(value) })), { value: 0, label: 'Never' }];
}

export function watts(value: number, suffix = '') {
	return `${value < 10 ? value.toFixed(1) : Math.round(value)} W${suffix}`;
}
