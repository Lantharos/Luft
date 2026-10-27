import { commands } from '#lib/bindings.js';
import type { Defaults, FontFamily, Role } from '#lib/bindings.js';

class FontLibrary {
	families = $state.raw<FontFamily[] | null>(null);
	defaults = $state.raw<Defaults | null>(null);
	#loading: Promise<void> | null = null;

	load() {
		this.#loading ??= Promise.all([commands.appearanceFonts(), this.defaults ?? commands.appearanceFontDefaults()])
			.then(([families, defaults]) => {
				this.families = families;
				this.defaults = defaults;
			})
			.finally(() => (this.#loading = null));
		return this.#loading;
	}

	choose(role: Role, family: string) {
		return family === this.defaults?.[role] ? commands.appearanceFontReset({ role }) : commands.appearanceFontUse({ role, family });
	}
}

export const fontLibrary = new FontLibrary();
