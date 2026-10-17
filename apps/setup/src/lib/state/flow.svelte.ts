import type { Phase } from '#lib/api/installer.js';

export type Step = 'region' | 'destination' | 'network' | 'account' | 'finishing' | 'secure-boot' | 'protect' | 'fingerprint' | 'ready';

const LIVE: Step[] = ['region', 'destination', 'network', 'account', 'finishing'];
const FIRST_BOOT: Step[] = ['secure-boot', 'protect', 'fingerprint', 'ready'];
const POINT_OF_NO_RETURN: Step = 'network';

class Flow {
	phase = $state<Phase | null>(null);
	index = $state(0);
	direction = $state(1);
	private skipped = $state<Step[]>([]);

	steps = $derived((this.phase === 'first-boot' ? FIRST_BOOT : LIVE).filter((step) => !this.skipped.includes(step)));
	step = $derived(this.steps[this.index]);
	canGoBack = $derived(this.index > 0 && this.step !== POINT_OF_NO_RETURN && this.step !== 'finishing' && this.step !== 'ready');

	skip(step: Step) {
		if (!this.skipped.includes(step)) this.skipped = [...this.skipped, step];
	}

	begin(phase: Phase, skipped: Step[]) {
		this.phase = phase;
		this.skipped = skipped;
		this.index = 0;
	}

	next() {
		this.direction = 1;
		this.index = Math.min(this.index + 1, this.steps.length - 1);
	}

	back() {
		if (!this.canGoBack) return;
		this.direction = -1;
		this.index -= 1;
	}

	goTo(step: Step) {
		const index = this.steps.indexOf(step);
		this.direction = index >= this.index ? 1 : -1;
		this.index = index;
	}
}

export const flow = new Flow();
