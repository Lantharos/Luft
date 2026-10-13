import { appearance } from '@luft/ui';
import { appState, trustState, type Hardware, type TrustState } from '#lib/api/system.js';
import { flow, type Step } from './flow.svelte.js';
import { install } from './install.svelte.js';
import { regional } from './regional.svelte.js';

function firstBootSkips(trust: TrustState | null): Step[] {
	const skips: Step[] = [];
	if (!trust || trust.secureBoot !== 'on' || trust.key === 'enrolled' || !trust.keyAvailable) skips.push('secure-boot');
	if (!trust || trust.encrypted || trust.encryption !== 'off') skips.push('protect');
	return skips;
}

class SetupState {
	hardware = $state<Hardware>({ nvidia: false, portable: false, onBattery: false });
	trust = $state<TrustState | null>(null);
	needsRestart = $state(false);
	ready = $state(false);

	async start() {
		const state = await appState();
		const stops = [appearance.start(state)];
		this.hardware = state.hardware;
		stops.push(await install.start(state.hardware));
		const phase = install.status?.phase ?? 'live';
		if (phase === 'first-boot') {
			this.trust = await trustState().catch(() => null);
			flow.begin(phase, firstBootSkips(this.trust));
		} else {
			await regional.start();
			flow.begin(phase, []);
		}
		this.ready = true;
		return () => stops.forEach((stop) => stop());
	}

	async refreshTrust() {
		this.trust = await trustState().catch(() => null);
	}
}

export const setup = new SetupState();
