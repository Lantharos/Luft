import { appearance } from '@luft/ui';
import { appState, NO_HARDWARE, trustState, type Hardware, type TrustState } from '#lib/api/system.js';
import { flow, type Step } from './flow.svelte.js';
import { install } from './install.svelte.js';
import { regional } from './regional.svelte.js';

function firstBootSkips(trust: TrustState | null, hardware: Hardware): Step[] {
	const skips: Step[] = [];
	if (!trust || trust.secureBoot !== 'on' || trust.key === 'enrolled' || !trust.keyAvailable) skips.push('secure-boot');
	if (!trust || trust.encrypted || trust.encryption !== 'off') skips.push('protect');
	if (!hardware.fingerprint) skips.push('fingerprint');
	return skips;
}

class SetupState {
	hardware = $state<Hardware>(NO_HARDWARE);
	trust = $state<TrustState | null>(null);
	secureBootCode = $state('');
	stagedRecoveryKey = $state('');
	refusedFingers = $state<string[]>([]);
	ready = $state(false);

	needsRestart = $derived(Boolean(this.secureBootCode || this.stagedRecoveryKey));

	async start() {
		const state = await appState();
		const stops = [appearance.start(state)];
		this.hardware = state.hardware;
		stops.push(await install.start(state.hardware, state.meet));
		const phase = install.status?.phase ?? 'live';
		if (phase === 'first-boot') {
			this.trust = await trustState().catch(() => null);
			void regional.adoptFormats().catch(() => {});
			flow.begin(phase, firstBootSkips(this.trust, this.hardware));
		} else {
			await regional.start();
			flow.begin(phase, []);
		}
		this.ready = true;
		return () => stops.forEach((stop) => stop());
	}
}

export const setup = new SetupState();
