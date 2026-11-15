import { appWindow, events as sabineEvents } from '@lantharos/sabine';
import { i18n } from '@luft/i18n';
import { appearance, keepWindowState } from '@luft/ui';
import type { Devices } from '#lib/bindings.js';
import { connect } from '#lib/bridge/index.js';
import type { Backend } from '#lib/bridge/types.js';
import { entries, focusOf } from './entries.svelte';
import { monitor } from './monitor.svelte';
import { processes } from './processes.svelte';
import { settings } from './settings.svelte';

const DISK_COLUMNS = ['read', 'write', 'readTotal', 'writeTotal'];
const GPU_COLUMNS = ['gpu', 'vram', 'encoder', 'decoder'];
export const TASKS = 'processes';

function hasPage(devices: Devices, page: string) {
	return [TASKS, 'cpu', 'memory'].includes(page) || [devices.gpus, devices.drives, devices.networks, devices.batteries].some((list) => list.some((device) => device.id === page));
}

class AppStore {
	page = $state(TASKS);
	backend = $state.raw<Backend | null>(null);
	#shown = $state(true);
	visible = $derived(this.#shown && this.backend !== null);

	async start() {
		const restored = appWindow.restoredState<string>();
		const backend = await connect();
		const state = await backend.appState();
		this.page = (await restored) ?? this.page;
		keepWindowState(() => this.page);
		appearance.start(state);
		await i18n.ready;
		settings.load(backend, state.settings);
		processes.start(backend);
		entries.start(backend);
		this.focus(focusOf(state.activation.arguments));
		sabineEvents.singleInstance((activation) => this.focus(focusOf(activation.arguments)));
		await backend.configure(settings.value.interval, settings.value.history);
		await monitor.start(backend);
		this.#watchVisibility();
		this.backend = backend;
		$effect.root(() => {
			let reset = true;
			$effect(() => {
				const columns = settings.value.columns;
				void backend.view({
					page: this.page,
					visible: this.visible,
					reset,
					expanded: entries.expanded,
					system: !entries.collapsed.has('system'),
					everything: settings.value.flat || entries.searching,
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
				if (devices && !hasPage(devices, this.page)) this.page = TASKS;
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

	focus(key: string | null) {
		if (!key) return;
		this.page = TASKS;
		entries.focusing = key;
	}

	#watchVisibility() {
		this.#shown = appWindow.visible;
		appWindow.onVisibilityChanged(({ visible }) => (this.#shown = visible));
	}
}

export const app = new AppStore();
