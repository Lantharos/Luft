import { t } from '@luft/i18n';

export function duration(seconds: number) {
	const minutes = Math.round(seconds / 60);
	if (minutes < 1) return t('settings-power-duration-under-minute');
	if (minutes < 60) return t('settings-power-duration-minutes', { minutes });
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? t('settings-power-duration-hours-minutes', { hours, minutes: rest }) : t('settings-power-duration-hours', { hours });
}

export function durationOptions(seconds: number[], current: number) {
	const values = seconds.includes(current) || current === 0 ? seconds : [...seconds, current].sort((left, right) => left - right);
	return [...values.map((value) => ({ value, label: duration(value) })), { value: 0, label: t('settings-power-never') }];
}

export const wattHours = (value: number) => t('settings-power-watt-hours', { value });
