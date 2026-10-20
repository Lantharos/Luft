import { load } from 'virtual:luft-locales';

import { type Args, Catalog, negotiate, sourceLocaleOf } from './core.js';

export interface Locale {
	languages: string[];
	formats: string;
	fixed: boolean;
}

const browserLocale = (): Locale => ({ languages: [...navigator.languages], formats: navigator.language, fixed: false });

class I18n {
	catalog = $state.raw<Catalog | null>(null);
	formats = $state(navigator.language);
	private readonly started = Promise.withResolvers<void>();
	readonly ready = this.started.promise;
	private fixed = false;

	get locale() {
		return this.catalog?.locale ?? 'en';
	}

	async start({ languages, formats, fixed }: Locale = browserLocale()) {
		this.formats = formats;
		await this.apply(negotiate(languages));
		this.fixed = fixed;
		this.started.resolve();
	}

	async use(locale: string, formats?: string) {
		if (!this.fixed) await this.apply(locale, formats);
	}

	private async apply(locale: string, formats?: string) {
		const source = await load(sourceLocaleOf(locale));
		this.catalog = new Catalog(locale, source);
		if (formats) this.formats = formats;
		document.documentElement.lang = locale;
	}
}

export const i18n = new I18n();

export const t = (id: string, args?: Args): string => i18n.catalog?.format(id, args) ?? '';
