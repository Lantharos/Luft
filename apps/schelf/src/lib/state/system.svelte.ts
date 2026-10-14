import type { System } from '#lib/bridge/types.js';

class SystemKind {
	kind = $state<System>('packages');

	get image() {
		return this.kind === 'image';
	}
}

export const system = new SystemKind();
