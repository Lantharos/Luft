export const SOURCE_LOCALE = 'en';
export const PSEUDO_LOCALE = 'en-XA';

export interface Language {
	tag: string;
	posix: string;
	name: string;
}

export const LANGUAGES: readonly Language[] = [
	{ tag: 'en', posix: 'en_US.UTF-8', name: 'English' },
	{ tag: 'de', posix: 'de_DE.UTF-8', name: 'Deutsch' },
	{ tag: 'sq', posix: 'sq_AL.UTF-8', name: 'Shqip' },
	{ tag: 'hr', posix: 'hr_HR.UTF-8', name: 'Hrvatski' },
	{ tag: 'sr', posix: 'sr_RS.UTF-8', name: 'Српски' },
	{ tag: 'sr-Latn', posix: 'sr_RS.UTF-8@latin', name: 'Srpski (latinica)' },
	{ tag: 'bs', posix: 'bs_BA.UTF-8', name: 'Bosanski' }
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

function scriptOf(tag: string): string | undefined {
	return tag.split('-').find((part) => part.length === 4);
}

export function match(tag: string): string | null {
	if (tag === PSEUDO_LOCALE) return PSEUDO_LOCALE;
	const language = tag.split('-')[0];
	const script = scriptOf(tag);
	const candidates = LOCALES.filter((locale) => locale.split('-')[0] === language);
	return (
		candidates.find((locale) => scriptOf(locale) === script) ??
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
