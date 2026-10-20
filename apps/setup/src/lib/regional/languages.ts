import { bcp47 } from '@luft/i18n';

export interface Language {
	locale: string;
	country: string;
	name: string;
}

const LOCALES: [locale: string, country: string][] = [
	['en_US.UTF-8', 'US'],
	['en_GB.UTF-8', 'GB'],
	['en_IE.UTF-8', 'IE'],
	['en_CA.UTF-8', 'CA'],
	['en_AU.UTF-8', 'AU'],
	['en_NZ.UTF-8', 'NZ'],
	['en_IN.UTF-8', 'IN'],
	['en_ZA.UTF-8', 'ZA'],
	['en_DK.UTF-8', 'DK'],
	['de_DE.UTF-8', 'DE'],
	['de_AT.UTF-8', 'AT'],
	['de_CH.UTF-8', 'CH'],
	['sq_AL.UTF-8', 'AL'],
	['sq_MK.UTF-8', 'MK'],
	['hr_HR.UTF-8', 'HR'],
	['bs_BA.UTF-8', 'BA'],
	['sr_RS.UTF-8', 'RS'],
	['sr_RS.UTF-8@latin', 'RS'],
	['sr_ME.UTF-8', 'ME']
];

function ownName(locale: string): string {
	const tag = bcp47(locale)!;
	const name = new Intl.DisplayNames(tag, { type: 'language', languageDisplay: 'standard' }).of(tag) ?? tag;
	return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1);
}

export const LANGUAGES: Language[] = LOCALES.map(([locale, country]) => ({ locale, country, name: ownName(locale) }));

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export const languageTag = (language: Language) => bcp47(language.locale)!;

export function languageFor(country: string | null): Language | null {
	return LANGUAGES.find((language) => language.country === country) ?? null;
}

export function languageNamed(locale: string | null): Language | null {
	const tag = locale && bcp47(locale);
	return LANGUAGES.find((language) => languageTag(language) === tag) ?? null;
}

const KEYBOARDS: Record<string, string> = {
	US: 'us', GB: 'gb', IE: 'ie', CA: 'us', AU: 'us', NZ: 'us', IN: 'us', ZA: 'us',
	DE: 'de', AT: 'at', CH: 'ch', LI: 'ch', LU: 'fr', FR: 'fr', BE: 'be', NL: 'us',
	ES: 'es', PT: 'pt', BR: 'br', MX: 'latam', AR: 'latam', CL: 'latam', CO: 'latam',
	IT: 'it', SE: 'se', NO: 'no', DK: 'dk', FI: 'fi', IS: 'is', EE: 'ee', LV: 'lv', LT: 'lt',
	PL: 'pl', CZ: 'cz', SK: 'sk', HU: 'hu', SI: 'si', HR: 'hr', RS: 'rs', RO: 'ro', BG: 'bg',
	GR: 'gr', TR: 'tr', RU: 'ru', UA: 'ua', IL: 'il', JP: 'jp', KR: 'kr', CN: 'cn', TW: 'tw', TH: 'th'
};

export function keyboardFor(country: string | null): string | null {
	return country ? (KEYBOARDS[country] ?? null) : null;
}

export function countryOf(tag: string | null): string | null {
	const region = tag?.split(/[-_.@]/)[1];
	return region && /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null;
}
