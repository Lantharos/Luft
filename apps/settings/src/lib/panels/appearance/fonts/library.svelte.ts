import { fontDefaults, fontFamilies, resetFont, useFont, type FontDefaults, type FontFamily, type FontRole } from './api';

class FontLibrary {
	families = $state.raw<FontFamily[] | null>(null);
	defaults = $state.raw<FontDefaults | null>(null);
	#loading: Promise<void> | null = null;

	load() {
		this.#loading ??= Promise.all([fontFamilies(), this.defaults ?? fontDefaults()])
			.then(([families, defaults]) => {
				this.families = families;
				this.defaults = defaults;
			})
			.finally(() => (this.#loading = null));
		return this.#loading;
	}

	choose(role: FontRole, family: string) {
		return family === this.defaults?.[role] ? resetFont(role) : useFont(role, family);
	}
}

export const fontLibrary = new FontLibrary();
