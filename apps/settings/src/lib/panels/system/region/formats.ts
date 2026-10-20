import { bcp47 } from '@luft/i18n';

export const FORMATS = [
	'en_US.UTF-8',
	'en_GB.UTF-8',
	'en_IE.UTF-8',
	'de_DE.UTF-8',
	'de_AT.UTF-8',
	'de_CH.UTF-8',
	'sq_AL.UTF-8',
	'sq_MK.UTF-8',
	'hr_HR.UTF-8',
	'bs_BA.UTF-8',
	'sr_RS.UTF-8',
	'sr_RS.UTF-8@latin',
	'sr_ME.UTF-8'
];

const SAMPLE_DATE = Date.UTC(2026, 2, 14, 15, 30);
const SAMPLE_NUMBER = 1234.56;

export const formatsTag = (region: string) => bcp47(region) ?? 'en-US';

export function formatsName(region: string, language: string): string {
	return new Intl.DisplayNames(language, { type: 'language' }).of(formatsTag(region)) ?? region;
}

export function formatsSample(region: string): string {
	const tag = formatsTag(region);
	const date = new Intl.DateTimeFormat(tag, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(SAMPLE_DATE);
	return `${date} · ${new Intl.NumberFormat(tag).format(SAMPLE_NUMBER)}`;
}
