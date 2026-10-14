import { onDestroy } from 'svelte';
import { loadDisplays, onDisplaysChanged, type Displays } from '#lib/panels/devices/display/api.js';

const FALLBACK_SHAPE = 16 / 10;

function mainDisplayShape(state: Displays) {
	const logical = state.logical.find((entry) => entry.primary) ?? state.logical[0];
	const monitor = state.monitors.find((entry) => entry.connector === logical?.monitors[0]);
	const mode = monitor?.modes.find((entry) => entry.current);
	if (!logical || !mode) return FALLBACK_SHAPE;
	return logical.transform % 2 === 1 ? mode.height / mode.width : mode.width / mode.height;
}

export function useScreenShape() {
	let shape = $state(FALLBACK_SHAPE);
	void loadDisplays().then((state) => (shape = mainDisplayShape(state)));
	onDestroy(onDisplaysChanged((state) => (shape = mainDisplayShape(state))));
	return {
		get aspect() {
			return shape;
		}
	};
}
