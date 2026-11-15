import { i18n, t } from '@luft/i18n';
import { longDateTime } from '@luft/ui';

export function formatDate(value: string | number) {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : longDateTime(date.getTime() / 1000);
}

export function formatNumber(value: number, fractionDigits: number, fixed = false) {
	return new Intl.NumberFormat(i18n.formats, { maximumFractionDigits: fractionDigits, minimumFractionDigits: fixed ? fractionDigits : 0 }).format(value);
}

export function formatExposure(seconds: number) {
	if (seconds >= 1) return t('magpie-details-seconds', { seconds: formatNumber(seconds, 1) });
	return t('magpie-details-fraction', { denominator: String(Math.round(1 / seconds)) });
}

function formatLatitude(value: number) {
	const degrees = formatNumber(Math.abs(value), 5);
	return value < 0 ? t('magpie-details-south', { degrees }) : t('magpie-details-north', { degrees });
}

function formatLongitude(value: number) {
	const degrees = formatNumber(Math.abs(value), 5);
	return value < 0 ? t('magpie-details-west', { degrees }) : t('magpie-details-east', { degrees });
}

export function formatLocation({ latitude, longitude }: { latitude: number; longitude: number }) {
	return t('magpie-details-coordinates', { latitude: formatLatitude(latitude), longitude: formatLongitude(longitude) });
}
