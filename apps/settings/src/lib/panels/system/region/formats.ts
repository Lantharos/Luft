import { bcp47 } from '@luft/i18n';

export const FORMATS = [
	'en_US.UTF-8',
	'en_GB.UTF-8',
	'en_IE.UTF-8',
	'bs_BA.UTF-8',
	'ca_ES.UTF-8',
	'ca_AD.UTF-8',
	'cs_CZ.UTF-8',
	'da_DK.UTF-8',
	'de_DE.UTF-8',
	'de_AT.UTF-8',
	'de_CH.UTF-8',
	'es_ES.UTF-8',
	'es_MX.UTF-8',
	'es_AR.UTF-8',
	'es_CO.UTF-8',
	'es_CL.UTF-8',
	'fr_FR.UTF-8',
	'fr_BE.UTF-8',
	'fr_CH.UTF-8',
	'fr_LU.UTF-8',
	'fr_CA.UTF-8',
	'hr_HR.UTF-8',
	'is_IS.UTF-8',
	'it_IT.UTF-8',
	'it_CH.UTF-8',
	'nl_NL.UTF-8',
	'nl_BE.UTF-8',
	'nb_NO.UTF-8',
	'nn_NO.UTF-8',
	'pl_PL.UTF-8',
	'pt_BR.UTF-8',
	'pt_PT.UTF-8',
	'ro_RO.UTF-8',
	'sq_AL.UTF-8',
	'sq_MK.UTF-8',
	'sk_SK.UTF-8',
	'sl_SI.UTF-8',
	'sr_RS.UTF-8@latin',
	'sv_SE.UTF-8',
	'sv_FI.UTF-8',
	'bg_BG.UTF-8',
	'mk_MK.UTF-8',
	'ru_RU.UTF-8',
	'sr_RS.UTF-8',
	'sr_ME.UTF-8',
	'uk_UA.UTF-8'
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
