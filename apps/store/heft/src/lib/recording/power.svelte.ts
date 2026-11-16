import { events, system, type PowerSource } from '@lantharos/sabine';
import { settings } from '#lib/app/settings.svelte.js';
import type { Processing } from './model';

class Power {
	battery = $state(false);
	onBattery = $state(false);
	private waiting: (() => void)[] = [];

	async start() {
		const stop = events.powerSourceChanged((source) => this.apply(source));
		const { source } = await system.power();
		if (source) this.apply(source);
		return stop;
	}

	private apply(source: PowerSource) {
		this.battery = source.batteryLevel !== null;
		this.onBattery = source.onBattery;
		if (!source.onBattery) this.waiting.splice(0).forEach((wake) => wake());
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
