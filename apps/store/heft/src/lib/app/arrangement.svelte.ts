import { appearance } from '@luft/ui';
import { innerHeight, innerWidth } from 'svelte/reactivity/window';

const MARGIN = 32;

/**
 * Folded into a tablet, or in a window taller than it is wide, the page fills
 * the width from edge to edge and the tools sit in a bar above it.
 */
class Arrangement {
	get tablet() {
		return appearance.posture === 'tablet' || (innerHeight.current ?? 0) > (innerWidth.current ?? 0);
	}

	/** Space beside a page fitted to the width. */
	get margin() {
		return this.tablet ? 0 : MARGIN;
	}
}

export const arrangement = new Arrangement();
