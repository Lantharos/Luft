import type { Backend, Devices, Tick } from '#lib/backend/types.js';
import { settings } from './settings.svelte';

class MonitorStore {
	devices = $state.raw<Devices | null>(null);
	ticks = $state.raw<Tick[]>([]);
	revision = $state(0);
	latest = $derived(this.ticks.at(-1) ?? null);
	capacity = $derived(Math.round((settings.value.history * 1000) / settings.value.interval) + 1);

	#backend: Backend | null = null;

	async start(backend: Backend) {
		this.#backend = backend;
		backend.onTick((tick) => this.#append([tick]));
		backend.onDevices((devices) => (this.devices = devices));
		await this.catchUp();
	}

	async catchUp() {
		if (!this.#backend) return;
		const snapshot = await this.#backend.snapshot(this.latest?.time ?? 0);
		this.devices = snapshot.devices;
		this.#append(snapshot.ticks);
	}

	#append(ticks: Tick[]) {
		if (!ticks.length) return;
		const next = this.ticks.concat(ticks);
		const keep = this.capacity + 1;
		this.ticks = next.length > keep ? next.slice(next.length - keep) : next;
		this.revision += ticks.length === 1 ? 1 : 2;
	}
}

export const monitor = new MonitorStore();
