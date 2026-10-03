import { invoke, listen } from '#lib/bridge.js';

export interface Hardware {
	bluetooth: boolean;
	battery: boolean;
	mouse: boolean;
	touchpad: boolean;
}

class HardwareStore {
	present = $state.raw<Hardware | null>(null);

	async start() {
		listen<Hardware>('hardware.changed', (next) => (this.present = next));
		this.present = await invoke<Hardware>('hardware');
	}
}

export const hardware = new HardwareStore();
