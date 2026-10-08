import { keyring, onKeyring, type Keyring } from './api';

export class KeyringState {
	current = $state<Keyring | null | undefined>();

	private readonly unsubscribe = onKeyring((next) => (this.current = next));

	load = async () => {
		this.current = await keyring().catch(() => null);
	};

	stop() {
		this.unsubscribe();
	}
}
