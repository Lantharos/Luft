import { commands, events } from '#lib/bindings.js';
import { settings } from '#lib/app/settings.svelte.js';
import type { Processing } from './model';

/** Whether the computer has a battery and runs on it, as UPower says, followed as the charger comes and goes. */
class Power {
	battery = $state(false);
	onBattery = $state(false);
	private waiting: (() => void)[] = [];

	async start() {
		const state = await commands.powerState();
		this.battery = state.battery;
		this.onBattery = state.onBattery;
		return events.powerBattery((onBattery) => {
			this.onBattery = onBattery;
			if (!onBattery) this.waiting.splice(0).forEach((wake) => wake());
		});
	}

	/** When heavy background work runs: as set, or once the charger is in on a computer with a battery. */
	get defaultProcessing(): Processing {
		return settings.values.backgroundWork ?? (this.battery ? 'charger' : 'now');
	}

	/** Whether background work that follows the setting has to wait for the charger now. */
	get waitsForCharger() {
		return this.defaultProcessing === 'charger' && this.onBattery;
	}

	/** Resolves once the charger is plugged in. */
	charger(): Promise<void> {
		if (!this.onBattery) return Promise.resolve();
		return new Promise((resolve) => this.waiting.push(resolve));
	}
}

export const power = new Power();
