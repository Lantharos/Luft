import { appWindow, isAvailable } from '@lantharos/sabine';
import { appearance } from '@luft/ui';
import { connect } from '$lib/backend';
import type { Backend, Devices } from '$lib/backend/types';
import { monitor } from './monitor.svelte';
import { processes } from './processes.svelte';
import { settings } from './settings.svelte';
import { usage } from './usage.svelte';

const DISK_COLUMNS = ['read', 'write', 'readTotal', 'writeTotal'];
const GPU_COLUMNS = ['gpu', 'vram', 'encoder', 'decoder'];

function hasPage(devices: Devices, page: string) {
	return ['apps', 'processes', 'cpu', 'memory'].includes(page) || [devices.gpus, devices.drives, devices.networks, devices.batteries].some((list) => list.some((device) => device.id === page));
}

class AppStore {
	page = $state('apps');
	backend = $state.raw<Backend | null>(null);
	#shown = $state(true);
	visible = $derived(this.#shown && this.backend !== null);

	async start() {
		const backend = await connect();
		const state = await backend.appState();
		if (isAvailable()) appearance.start(state);
		settings.load(backend, state.settings);
		processes.start(backend);
		usage.start(backend);
		await backend.configure(settings.value.interval, settings.value.history);
		await monitor.start(backend);
		this.#watchVisibility();
		this.backend = backend;
		$effect.root(() => {
			let reset = true;
			$effect(() => {
				const apps = this.page === 'apps';
				const columns = apps ? settings.value.appColumns : settings.value.processColumns;
				void backend.view({
					page: this.page,
					visible: this.visible,
					reset,
					expanded: apps ? usage.expanded : [],
					disk: columns.some((column) => DISK_COLUMNS.includes(column)),
					gpu: columns.some((column) => GPU_COLUMNS.includes(column))
				});
				reset = false;
			});
			$effect(() => {
				void backend.configure(settings.value.interval, settings.value.history);
			});
			$effect(() => {
				const devices = monitor.devices;
				if (devices && !hasPage(devices, this.page)) this.page = 'apps';
			});
			let wasVisible = true;
			$effect(() => {
				if (this.visible && !wasVisible) void monitor.catchUp();
				wasVisible = this.visible;
			});
		});
	}

	open(page: string) {
		this.page = page;
	}

	#watchVisibility() {
		if (isAvailable()) {
			this.#shown = appWindow.visible;
			appWindow.onVisibilityChanged(({ visible }) => (this.#shown = visible));
			return;
		}
		this.#shown = document.visibilityState === 'visible';
		document.addEventListener('visibilitychange', () => (this.#shown = document.visibilityState === 'visible'));
	}
}

export const app = new AppStore();
