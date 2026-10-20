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
	{ tag: 'da', posix: 'da_DK.UTF-8', name: 'Dansk' },
	{ tag: 'de', posix: 'de_DE.UTF-8', name: 'Deutsch' },
	{ tag: 'es', posix: 'es_ES.UTF-8', name: 'Español' },
	{ tag: 'fr', posix: 'fr_FR.UTF-8', name: 'Français' },
	{ tag: 'hr', posix: 'hr_HR.UTF-8', name: 'Hrvatski' },
	{ tag: 'is', posix: 'is_IS.UTF-8', name: 'Íslenska' },
	{ tag: 'it', posix: 'it_IT.UTF-8', name: 'Italiano' },
	{ tag: 'nl', posix: 'nl_NL.UTF-8', name: 'Nederlands' },
	{ tag: 'nb', posix: 'nb_NO.UTF-8', name: 'Norsk bokmål' },
	{ tag: 'nn', posix: 'nn_NO.UTF-8', name: 'Norsk nynorsk' },
	{ tag: 'pt-BR', posix: 'pt_BR.UTF-8', name: 'Português (Brasil)' },
	{ tag: 'pt', posix: 'pt_PT.UTF-8', name: 'Português (Portugal)' },
	{ tag: 'ro', posix: 'ro_RO.UTF-8', name: 'Română' },
	{ tag: 'sq', posix: 'sq_AL.UTF-8', name: 'Shqip' },
	{ tag: 'sr-Latn', posix: 'sr_RS.UTF-8@latin', name: 'Srpski (latinica)' },
	{ tag: 'sv', posix: 'sv_SE.UTF-8', name: 'Svenska' },
	{ tag: 'sr', posix: 'sr_RS.UTF-8', name: 'Српски' }
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
