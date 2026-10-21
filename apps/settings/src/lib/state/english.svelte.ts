import { i18n } from '@luft/i18n';
import { Catalog } from '@luft/i18n/core';
import { load } from 'virtual:luft-locales';
import type { Translate } from '@luft/settings-pages';

class EnglishStore {
	private catalog = $state.raw<Catalog | null>(null);
	private requested = false;

	get translate(): Translate | undefined {
		if (i18n.locale === 'en') return undefined;
		if (!this.requested) {
			this.requested = true;
			void load('en').then((source) => (this.catalog = new Catalog('en', source)));
		}
		const catalog = this.catalog;
		return catalog ? (id) => catalog.format(id) : undefined;
	}
}

export const english = new EnglishStore();
