import { FluentBundle, FluentResource, type FluentVariable } from '@fluent/bundle';

export { FluentNumber } from '@fluent/bundle';

import { PSEUDO_LOCALE, SOURCE_LOCALE } from './locales.js';
import { pseudolocalize } from './pseudo.js';

export { bcp47, languageOf, LANGUAGES, LOCALES, match, negotiate, PSEUDO_LOCALE, SOURCE_LOCALE, type Language } from './locales.js';
export { pseudolocalize } from './pseudo.js';

export type Args = Record<string, FluentVariable>;

const ENTRY = /^(-?[a-zA-Z][\w-]*) *=/gm;
const REFERENCE = /\{\s*(-?[a-zA-Z][\w-]*)(?:\.[\w-]+)?\s*\}/g;

function entries(source: string): Map<string, number> {
	const starts = new Map<string, number>();
	ENTRY.lastIndex = 0;
	for (let match = ENTRY.exec(source); match; match = ENTRY.exec(source)) starts.set(match[1], match.index);
	return starts;
}

function entryAt(source: string, start: number): string {
	ENTRY.lastIndex = start + 1;
	const next = ENTRY.exec(source);
	return source.slice(start, next?.index ?? source.length);
}

export class Catalog {
	private readonly bundle: FluentBundle;
	private readonly unparsed: Map<string, number>;

	constructor(
		readonly locale: string,
		private readonly source: string
	) {
		const pseudo = locale === PSEUDO_LOCALE;
		this.bundle = new FluentBundle(pseudo ? SOURCE_LOCALE : locale, {
			useIsolating: false,
			transform: pseudo ? pseudolocalize : undefined
		});
		this.unparsed = entries(source);
	}

	private parse(id: string) {
		const start = this.unparsed.get(id);
		if (start === undefined) return;
		this.unparsed.delete(id);
		const entry = entryAt(this.source, start);
		for (const [, reference] of entry.matchAll(REFERENCE)) this.parse(reference);
		this.bundle.addResource(new FluentResource(entry));
	}

	private message(id: string) {
		this.parse(id);
		return this.bundle.getMessage(id);
	}

	has(id: string): boolean {
		const [message, attribute] = id.split('.');
		const found = this.message(message);
		return attribute ? Boolean(found?.attributes[attribute]) : Boolean(found?.value);
	}

	format(id: string, args?: Args): string {
		const [message, attribute] = id.split('.');
		const found = this.message(message);
		const pattern = attribute ? found?.attributes[attribute] : found?.value;
		if (!pattern) return id;
		return this.bundle.formatPattern(pattern, args, []);
	}
}

export const sourceLocaleOf = (locale: string) => (locale === PSEUDO_LOCALE ? SOURCE_LOCALE : locale);
