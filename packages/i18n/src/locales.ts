export const SOURCE_LOCALE = 'en';
export const PSEUDO_LOCALE = 'en-XA';

export interface Language {
	tag: string;
	posix: string;
	name: string;
}

export const LANGUAGES: readonly Language[] = [
	{ tag: 'en', posix: 'en_US.UTF-8', name: 'English' },
	{ tag: 'bs', posix: 'bs_BA.UTF-8', name: 'Bosanski' },
	{ tag: 'ca', posix: 'ca_ES.UTF-8', name: 'Català' },
	{ tag: 'cs', posix: 'cs_CZ.UTF-8', name: 'Čeština' },
	{ tag: 'da', posix: 'da_DK.UTF-8', name: 'Dansk' },
	{ tag: 'de', posix: 'de_DE.UTF-8', name: 'Deutsch' },
	{ tag: 'et', posix: 'et_EE.UTF-8', name: 'Eesti' },
	{ tag: 'es', posix: 'es_ES.UTF-8', name: 'Español' },
	{ tag: 'fr', posix: 'fr_FR.UTF-8', name: 'Français' },
	{ tag: 'ga', posix: 'ga_IE.UTF-8', name: 'Gaeilge' },
	{ tag: 'hr', posix: 'hr_HR.UTF-8', name: 'Hrvatski' },
	{ tag: 'is', posix: 'is_IS.UTF-8', name: 'Íslenska' },
	{ tag: 'it', posix: 'it_IT.UTF-8', name: 'Italiano' },
	{ tag: 'lv', posix: 'lv_LV.UTF-8', name: 'Latviešu' },
	{ tag: 'lt', posix: 'lt_LT.UTF-8', name: 'Lietuvių' },
	{ tag: 'hu', posix: 'hu_HU.UTF-8', name: 'Magyar' },
	{ tag: 'mt', posix: 'mt_MT.UTF-8', name: 'Malti' },
	{ tag: 'nl', posix: 'nl_NL.UTF-8', name: 'Nederlands' },
	{ tag: 'nb', posix: 'nb_NO.UTF-8', name: 'Norsk bokmål' },
	{ tag: 'nn', posix: 'nn_NO.UTF-8', name: 'Norsk nynorsk' },
	{ tag: 'pl', posix: 'pl_PL.UTF-8', name: 'Polski' },
	{ tag: 'pt-BR', posix: 'pt_BR.UTF-8', name: 'Português (Brasil)' },
	{ tag: 'pt', posix: 'pt_PT.UTF-8', name: 'Português (Portugal)' },
	{ tag: 'ro', posix: 'ro_RO.UTF-8', name: 'Română' },
	{ tag: 'sq', posix: 'sq_AL.UTF-8', name: 'Shqip' },
	{ tag: 'sk', posix: 'sk_SK.UTF-8', name: 'Slovenčina' },
	{ tag: 'sl', posix: 'sl_SI.UTF-8', name: 'Slovenščina' },
	{ tag: 'sr-Latn', posix: 'sr_RS.UTF-8@latin', name: 'Srpski (latinica)' },
	{ tag: 'fi', posix: 'fi_FI.UTF-8', name: 'Suomi' },
	{ tag: 'sv', posix: 'sv_SE.UTF-8', name: 'Svenska' },
	{ tag: 'tr', posix: 'tr_TR.UTF-8', name: 'Türkçe' },
	{ tag: 'el', posix: 'el_GR.UTF-8', name: 'Ελληνικά' },
	{ tag: 'bg', posix: 'bg_BG.UTF-8', name: 'Български' },
	{ tag: 'mk', posix: 'mk_MK.UTF-8', name: 'Македонски' },
	{ tag: 'ru', posix: 'ru_RU.UTF-8', name: 'Русский' },
	{ tag: 'sr', posix: 'sr_RS.UTF-8', name: 'Српски' },
	{ tag: 'uk', posix: 'uk_UA.UTF-8', name: 'Українська' }
];

export const LOCALES: readonly string[] = LANGUAGES.map((language) => language.tag);

const SCRIPT_MODIFIERS: Record<string, string> = { latin: 'Latn', cyrillic: 'Cyrl' };

export function bcp47(locale: string): string | null {
	const [base, modifier] = locale.split('@');
	const [name] = base.split('.');
	if (!name || name === 'C' || name === 'POSIX') return null;
	const [language, region] = name.split(/[_-]/);
	const script = modifier ? SCRIPT_MODIFIERS[modifier.toLowerCase()] : undefined;
	return [language.toLowerCase(), script, region?.toUpperCase()].filter(Boolean).join('-');
}

const LANGUAGE_ALIASES: Record<string, string> = { no: 'nb' };

const subtagsOf = (tag: string) => tag.split('-').slice(1);
const scriptOf = (tag: string) => subtagsOf(tag).find((part) => part.length === 4);
const regionOf = (tag: string) => subtagsOf(tag).find((part) => /^([a-z]{2}|\d{3})$/i.test(part))?.toUpperCase();

export function match(tag: string): string | null {
	if (tag === PSEUDO_LOCALE) return PSEUDO_LOCALE;
	const subtag = tag.split('-')[0];
	const language = LANGUAGE_ALIASES[subtag] ?? subtag;
	const script = scriptOf(tag);
	const region = regionOf(tag);
	const candidates = LOCALES.filter((locale) => locale.split('-')[0] === language);
	const sameScript = candidates.filter((locale) => scriptOf(locale) === script);
	return (
		sameScript.find((locale) => regionOf(locale) === region) ??
		sameScript.find((locale) => regionOf(locale) === undefined) ??
		sameScript[0] ??
		candidates.find((locale) => scriptOf(locale) === undefined && script !== 'Latn') ??
		candidates[0] ??
		null
	);
}

export function negotiate(requested: readonly string[]): string {
	for (const tag of requested) {
		const found = match(tag);
		if (found) return found;
	}
	return SOURCE_LOCALE;
}

export function languageOf(posix: string): Language {
	return LANGUAGES.find((language) => language.tag === match(bcp47(posix) ?? '')) ?? LANGUAGES[0];
}
