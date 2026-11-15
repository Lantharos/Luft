import { i18n } from './store.svelte.js';

export function resolved<T>(build: () => T): () => T {
	let catalog: typeof i18n.catalog | undefined;
	let value: T;
	return () => {
		if (catalog !== i18n.catalog) {
			catalog = i18n.catalog;
			value = build();
		}
		return value;
	};
}
