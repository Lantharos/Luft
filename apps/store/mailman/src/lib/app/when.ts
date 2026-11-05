export interface Moment {
	id: string;
	label: string;
	at: () => number;
}

function at(days: number, hour: number) {
	const date = new Date();
	date.setDate(date.getDate() + days);
	date.setHours(hour, 0, 0, 0);
	return Math.floor(date.getTime() / 1000);
}

function nextWeekday(day: number, hour: number) {
	const today = new Date().getDay();
	const ahead = (day - today + 7) % 7 || 7;
	return at(ahead, hour);
}

function laterToday() {
	const hour = new Date().getHours();
	return hour < 15 ? at(0, Math.max(hour + 3, 13)) : at(0, Math.min(hour + 3, 23));
}

export const SNOOZES: Moment[] = [
	{ id: 'later', label: 'Later today', at: laterToday },
	{ id: 'tomorrow', label: 'Tomorrow morning', at: () => at(1, 8) },
	{ id: 'weekend', label: 'This weekend', at: () => nextWeekday(6, 9) },
	{ id: 'week', label: 'Next week', at: () => nextWeekday(1, 8) },
	{ id: 'month', label: 'In a month', at: () => at(30, 8) }
];

export const SEND_LATER: Moment[] = [
	{ id: 'hour', label: 'In an hour', at: () => Math.floor(Date.now() / 1000) + 3600 },
	{ id: 'tomorrow', label: 'Tomorrow morning', at: () => at(1, 8) },
	{ id: 'monday', label: 'Monday morning', at: () => nextWeekday(1, 8) }
];

export const REMINDERS = [
	{ seconds: 24 * 3600, label: 'In a day' },
	{ seconds: 3 * 24 * 3600, label: 'In 3 days' },
	{ seconds: 7 * 24 * 3600, label: 'In a week' }
];
