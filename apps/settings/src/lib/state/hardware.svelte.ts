import { commands, events } from '#lib/bindings.js';
import type { Hardware } from '#lib/bindings.js';
import { SettingsGroup } from './gsettings.svelte.js';

class HardwareStore {
	private detected = $state.raw<Hardware | null>(null);
	private copilotKey = $state.raw<SettingsGroup<{ seen: boolean }> | null>(null);

	present = $derived<Hardware | null>(
		this.detected && { ...this.detected, copilotKey: this.detected.copilotKey && (this.copilotKey?.values.seen ?? false) }
	);

	async start() {
		this.copilotKey = new SettingsGroup('com.lantharos.kestrel.copilot-key', ['seen']);
		events.hardwareChanged((next) => (this.detected = next));
		this.detected = await commands.hardware();
	}
}

export const hardware = new HardwareStore();
