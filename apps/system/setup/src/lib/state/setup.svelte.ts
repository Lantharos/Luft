import { i18n } from '@luft/i18n';
import { appearance } from '@luft/ui';
import { commands, type Hardware, type TrustState } from '#lib/bindings.js';
import { NO_HARDWARE } from '#lib/bridge/system.js';
import { flow, type Step } from './flow.svelte.js';
import { install } from './install.svelte.js';
import { regional } from './regional.svelte.js';

function firstBootSkips(trust: TrustState | null, hardware: Hardware): Step[] {
	const skips: Step[] = [];
	if (!trust || trust.secureBoot !== 'on' || trust.key !== 'none' || !trust.keyAvailable) skips.push('secure-boot');
	if (!hardware.fingerprint) skips.push('fingerprint');
	return skips;
}

class SetupState {
	hardware = $state<Hardware>(NO_HARDWARE);
	trust = $state<TrustState | null>(null);
	secureBootCode = $state('');
	refusedFingers = $state<string[]>([]);
	ready = $state(false);

	async start() {
		const state = await commands.appState();
		const stops = [appearance.start(state)];
		await i18n.ready;
		this.hardware = state.hardware;
		stops.push(await install.start(state.hardware, state.meet));
		const phase = install.status?.phase ?? 'live';
		this.trust = await commands.trustState().catch(() => null);
		if (phase === 'first-boot') {
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
