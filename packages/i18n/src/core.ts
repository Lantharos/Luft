import { FluentBundle, FluentResource, type FluentVariable } from '@fluent/bundle';

export { FluentNumber } from '@fluent/bundle';

import { PSEUDO_LOCALE, SOURCE_LOCALE } from './locales.js';
import { pseudolocalize } from './pseudo.js';

export { bcp47, languageOf, LANGUAGES, LOCALES, match, negotiate, PSEUDO_LOCALE, SOURCE_LOCALE, type Language } from './locales.js';
export { pseudolocalize } from './pseudo.js';

export type Args = Record<string, FluentVariable>;

export class Catalog {
	private readonly bundle: FluentBundle;

	constructor(
		readonly locale: string,
		source: string
	) {
		const pseudo = locale === PSEUDO_LOCALE;
		this.bundle = new FluentBundle(pseudo ? SOURCE_LOCALE : locale, {
			useIsolating: false,
			transform: pseudo ? pseudolocalize : undefined
		});
		this.bundle.addResource(new FluentResource(source));
	}

	has(id: string): boolean {
		const [message, attribute] = id.split('.');
		const found = this.bundle.getMessage(message);
		return attribute ? Boolean(found?.attributes[attribute]) : Boolean(found?.value);
	}

	format(id: string, args?: Args): string {
		const [message, attribute] = id.split('.');
		const found = this.bundle.getMessage(message);
		const pattern = attribute ? found?.attributes[attribute] : found?.value;
		if (!pattern) return id;
		return this.bundle.formatPattern(pattern, args, []);
	}
}

export const sourceLocaleOf = (locale: string) => (locale === PSEUDO_LOCALE ? SOURCE_LOCALE : locale);
