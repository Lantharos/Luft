import { i18n, t } from '@luft/i18n';

export type Field = 'language' | 'keyboard' | 'zone';
export type Source = 'network' | 'computer';
export type Guesses = Partial<Record<Field, Source>>;

const FIELDS: Field[] = ['language', 'keyboard', 'zone'];
const SOURCES: Source[] = ['computer', 'network'];
const NAMES: Record<Field, string> = { language: 'setup-region-field-language', keyboard: 'setup-region-field-keyboard', zone: 'setup-region-field-time-zone' };
const FROM: Record<Source, string> = { computer: 'setup-region-guess-from-computer', network: 'setup-region-guess-from-network' };

export const outranks = (source: Source, other: Source | undefined) => !other || SOURCES.indexOf(source) <= SOURCES.indexOf(other);

export function describe(guesses: Guesses): string {
	const guessed = FIELDS.filter((field) => guesses[field]);
	if (guessed.length === 0) return t('setup-region-intro');
	if (guessed.length === FIELDS.length && guessed.every((field) => guesses[field] === 'computer')) return t('setup-region-intro-guessed-computer');
	const list = new Intl.ListFormat(i18n.locale);
	const parts = SOURCES.flatMap((source) => {
		const names = guessed.filter((field) => guesses[field] === source).map((field) => t(NAMES[field]));
		return names.length ? [t(FROM[source], { fields: list.format(names) })] : [];
	});
	return t('setup-region-intro-guessed', { guesses: list.format(parts) });
}
