import { commands, type Capabilities } from '#lib/bindings.js';

class Found {
	current = $state.raw<Capabilities | null>(null);
	#loading: Promise<void> | null = null;

	load() {
		this.#loading ??= commands.capabilities().then((found) => {
			this.current = found;
		});
		return this.#loading;
	}

	missing(id: string) {
		return this.current?.missing.includes(id) ?? false;
	}

	codecs(ids: readonly string[]) {
		const found = this.current;
		if (!found) return [];
		return ids.filter((id) => found.videoCodecs.some((codec) => codec.id === id) || found.hardwareCodecs.some((codec) => codec.id === id));
	}

	hardware(codec: string | null) {
		return this.current?.hardwareCodecs.find((item) => codec === null || item.id === codec) ?? null;
	}
}

export const capabilities = new Found();
