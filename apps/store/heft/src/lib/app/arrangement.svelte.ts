import { appearance } from '@luft/ui';
import { innerHeight, innerWidth } from 'svelte/reactivity/window';

const MARGIN = 32;

class Arrangement {
	get tablet() {
		return appearance.posture === 'tablet' || (innerHeight.current ?? 0) > (innerWidth.current ?? 0);
	}

	get margin() {
		return this.tablet ? 0 : MARGIN;
	}
}

export const arrangement = new Arrangement();
