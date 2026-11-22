import { commands, events, type Job, type Origin, type Policy } from '#lib/bindings.js';

class PolicyState {
	current = $state<Policy | null>(null);

	constructor() {
		void commands.policy().then((policy) => (this.current = policy));
		void events.schelfPolicy((policy) => (this.current = policy));
	}

	/** Whether the policy lets apps from this part of the catalog be installed. */
	installs(origin: Origin): boolean {
		const software = this.current?.software;
		if (!software) return true;
		if (origin === 'fedora') return software['system-packages'];
		const sources = software['app-sources'];
		return !sources || sources.includes(origin === 'schelf' ? 'schelf-store' : 'flathub');
	}

	get addsSources(): boolean {
		return this.current?.software['package-sources'] ?? true;
	}
}

export const policy = new PolicyState();

/** Whether the policy lets a job run, asked again each time the policy changes. */
export function allowance(job: () => Job | null) {
	const permit = $state({ allowed: true });
	$effect(() => {
		void policy.current;
		const wanted = job();
		if (wanted) void commands.policyAllows({ job: wanted }).then((allowed) => (permit.allowed = allowed));
	});
	return permit;
}
