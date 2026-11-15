import { t } from '@luft/i18n';

export interface Moment {
	id: string;
	label: () => string;
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
	{ id: 'later', label: () => t('mailman-later-today'), at: laterToday },
	{ id: 'tomorrow', label: () => t('mailman-later-tomorrow'), at: () => at(1, 8) },
	{ id: 'weekend', label: () => t('mailman-later-weekend'), at: () => nextWeekday(6, 9) },
	{ id: 'week', label: () => t('mailman-later-next-week'), at: () => nextWeekday(1, 8) },
	{ id: 'month', label: () => t('mailman-later-month'), at: () => at(30, 8) }
];

export const SEND_LATER: Moment[] = [
	{ id: 'hour', label: () => t('mailman-send-later-hour'), at: () => Math.floor(Date.now() / 1000) + 3600 },
	{ id: 'tomorrow', label: () => t('mailman-send-later-tomorrow'), at: () => at(1, 8) },
	{ id: 'monday', label: () => t('mailman-send-later-monday'), at: () => nextWeekday(1, 8) }
];

export const REMINDERS = [
	{ seconds: 24 * 3600, label: () => t('mailman-reminder-day'), chip: () => t('mailman-reminder-chip-day') },
	{ seconds: 3 * 24 * 3600, label: () => t('mailman-reminder-three-days'), chip: () => t('mailman-reminder-chip-three-days') },
	{ seconds: 7 * 24 * 3600, label: () => t('mailman-reminder-week'), chip: () => t('mailman-reminder-chip-week') }
];
