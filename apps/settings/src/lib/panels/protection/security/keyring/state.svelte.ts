import { commands, events } from '#lib/bindings.js';
import type { Keyring } from '#lib/bindings.js';

export class KeyringState {
	current = $state<Keyring | null | undefined>();

	private readonly unsubscribe = events.keyringChanged((next) => (this.current = next));

	load = async () => {
		this.current = await commands.keyring().catch(() => null);
	};

	stop() {
		this.unsubscribe();
	}
}
