import { commands, events, type Policy } from '#lib/bindings.js';

class PolicyState {
	current = $state<Policy | null>(null);

	constructor() {
		void events.policyChanged((policy) => (this.current = policy));
		void commands.policy().then((policy) => (this.current = policy));
	}
}

export const policy = new PolicyState();
