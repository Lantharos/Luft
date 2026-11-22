import { commands, type Policy } from '#lib/bindings.js';

class PolicyState {
	current = $state<Policy | null>(null);

	constructor() {
		void commands.policy().then((policy) => (this.current = policy));
	}
}

export const policy = new PolicyState();
