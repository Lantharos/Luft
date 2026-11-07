import { commands, type Encryption, type Target } from '#lib/bindings.js';
import { flow } from '#lib/state/flow.svelte.js';
import { install } from '#lib/state/install.svelte.js';
import { regional } from '#lib/state/regional.svelte.js';

async function onCable() {
	const network = await commands.networkOpen().catch(() => null);
	void commands.networkClose().catch(() => {});
	return network?.wired.some((link) => link.state === 'connected') ?? false;
}

export async function begin(target: Target, encryption: Encryption | null) {
	if (!(await install.install(target, encryption))) return;
	if (install.replacing?.owner?.password) flow.skip('account');
	if (await onCable()) {
		flow.skip('network');
		void regional.locate();
	}
	flow.next();
}
