import { commands, events } from '#lib/bindings.js';
import { settings } from '#lib/app/settings.svelte.js';
import type { Processing } from './model';

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

	get defaultProcessing(): Processing {
		return settings.values.backgroundWork ?? (this.battery ? 'charger' : 'now');
	}

	get waitsForCharger() {
		return this.defaultProcessing === 'charger' && this.onBattery;
	}

	charger(): Promise<void> {
		if (!this.onBattery) return Promise.resolve();
		return new Promise((resolve) => this.waiting.push(resolve));
	}
}

export const power = new Power();
