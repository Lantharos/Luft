import type { Encryption, Target } from '#lib/bindings.js';
import { flow } from '#lib/state/flow.svelte.js';
import { install } from '#lib/state/install.svelte.js';

export async function begin(target: Target, encryption: Encryption | null) {
	if (!(await install.install(target, encryption))) return;
	if (install.replacing?.owner?.password) flow.skip('account');
	flow.next();
}
