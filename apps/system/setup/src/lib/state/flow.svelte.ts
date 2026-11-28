import type { Phase } from '#lib/bindings.js';

export type Step =
	| 'welcome'
	| 'region'
	| 'early'
	| 'owner'
	| 'destination'
	| 'network'
	| 'account'
	| 'finishing'
	| 'network-type'
	| 'secure-boot'
	| 'protect'
	| 'fingerprint'
	| 'ready'
	| 'handed-over';

const LIVE: Step[] = ['region', 'early', 'owner', 'destination', 'protect', 'network', 'account', 'finishing'];
const STEPS: Record<Phase, Step[]> = {
	live: LIVE,
	installed: LIVE,
	handover: ['secure-boot', 'handed-over'],
	unclaimed: ['welcome', 'region', 'early', 'network', 'account', 'protect'],
	'first-boot': ['network-type', 'secure-boot', 'fingerprint', 'ready']
};
const WHILE_INSTALLING: Step[] = ['network', 'account', 'finishing'];
const FINAL: Step[] = ['finishing', 'ready', 'handed-over'];

class Flow {
	phase = $state<Phase | null>(null);
	index = $state(0);
	private skipped = $state<Step[]>([]);

	steps = $derived(STEPS[this.phase ?? 'live'].filter((step) => !this.skipped.includes(step)));
	step = $derived(this.steps[this.index]);
	canGoBack = $derived(
		this.index > 0 &&
			!FINAL.includes(this.step) &&
			this.steps[this.index - 1] !== 'welcome' &&
			(this.phase === 'unclaimed' || !WHILE_INSTALLING.includes(this.step) || WHILE_INSTALLING.includes(this.steps[this.index - 1]))
	);

	skip(step: Step) {
		if (!this.skipped.includes(step)) this.skipped = [...this.skipped, step];
	}

	restore(steps: Step[]) {
		this.skipped = this.skipped.filter((step) => !steps.includes(step));
	}

	begin(phase: Phase, skipped: Step[]) {
		this.phase = phase;
		this.skipped = skipped;
		this.index = 0;
	}

	next() {
		this.index = Math.min(this.index + 1, this.steps.length - 1);
	}

	back() {
		if (!this.canGoBack) return;
		this.index -= 1;
	}

	goTo(step: Step) {
		const index = this.steps.indexOf(step);
		this.index = index;
	}
}

export const flow = new Flow();
