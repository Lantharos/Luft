import { onDestroy } from 'svelte';
import { commands, events } from '#lib/bindings.js';
import type { Displays } from '#lib/bindings.js';

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
	void commands.displayState().then((state) => (shape = mainDisplayShape(state)));
	onDestroy(events.displayChanged((state) => (shape = mainDisplayShape(state))));
	return {
		get aspect() {
			return shape;
		}
	};
}
