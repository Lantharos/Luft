import { invoke, listen } from '#lib/bridge/index.js';
import { SettingsGroup } from './gsettings.svelte.js';

export interface Hardware {
	bluetooth: boolean;
	battery: boolean;
	mouse: boolean;
	touchpad: boolean;
	copilotKey: boolean;
}

class HardwareStore {
	private detected = $state.raw<Hardware | null>(null);
	private copilotKey = $state.raw<SettingsGroup<{ seen: boolean }> | null>(null);

	present = $derived<Hardware | null>(
		this.detected && { ...this.detected, copilotKey: this.detected.copilotKey && (this.copilotKey?.values.seen ?? false) }
	);

	async start() {
		this.copilotKey = new SettingsGroup('com.lantharos.kestrel.copilot-key', ['seen']);
		listen<Hardware>('hardware.changed', (next) => (this.detected = next));
		this.detected = await invoke<Hardware>('hardware');
	}
}

export const hardware = new HardwareStore();
