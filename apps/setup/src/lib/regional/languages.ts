export interface Language {
	locale: string;
	country: string;
	name: string;
}

export const LANGUAGES: Language[] = [
	{ locale: 'en_US.UTF-8', country: 'US', name: 'English (United States)' },
	{ locale: 'en_GB.UTF-8', country: 'GB', name: 'English (United Kingdom)' },
	{ locale: 'en_IE.UTF-8', country: 'IE', name: 'English (Ireland)' },
	{ locale: 'en_CA.UTF-8', country: 'CA', name: 'English (Canada)' },
	{ locale: 'en_AU.UTF-8', country: 'AU', name: 'English (Australia)' },
	{ locale: 'en_NZ.UTF-8', country: 'NZ', name: 'English (New Zealand)' },
	{ locale: 'en_IN.UTF-8', country: 'IN', name: 'English (India)' },
	{ locale: 'en_ZA.UTF-8', country: 'ZA', name: 'English (South Africa)' },
	{ locale: 'en_DK.UTF-8', country: 'DK', name: 'English (Denmark)' }
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];

export function languageFor(country: string | null): Language | null {
	return LANGUAGES.find((language) => language.country === country) ?? null;
}

export function languageNamed(locale: string | null): Language | null {
	return LANGUAGES.find((language) => language.locale === `${locale}.UTF-8`) ?? null;
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
