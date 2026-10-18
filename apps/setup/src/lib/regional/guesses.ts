export type Field = 'language' | 'keyboard' | 'zone';
export type Source = 'network' | 'computer';
export type Guesses = Partial<Record<Field, Source>>;

const FIELDS: Field[] = ['language', 'keyboard', 'zone'];
const SOURCES: Source[] = ['computer', 'network'];
const NAMES: Record<Field, string> = { language: 'language', keyboard: 'keyboard', zone: 'time zone' };
const PLACES: Record<Source, string> = { computer: 'your computer', network: 'your network' };
const START = 'Let’s get you set up.';

export const outranks = (source: Source, other: Source | undefined) => !other || SOURCES.indexOf(source) <= SOURCES.indexOf(other);

function list(names: string[]) {
	return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

export function describe(guesses: Guesses): string {
	const guessed = FIELDS.filter((field) => guesses[field]);
	if (guessed.length === 0) return `${START} Choose your language, keyboard and time zone.`;
	if (guessed.length === FIELDS.length && guessed.every((field) => guesses[field] === 'computer')) {
		return `${START} We guessed these from your computer, so change anything that’s off.`;
	}
	const parts = SOURCES.flatMap((source) => {
		const names = guessed.filter((field) => guesses[field] === source).map((field) => NAMES[field]);
		return names.length ? [`your ${list(names)} from ${PLACES[source]}`] : [];
	});
	return `${START} We guessed ${parts.join(' and ')}, so change anything that’s off.`;
}
