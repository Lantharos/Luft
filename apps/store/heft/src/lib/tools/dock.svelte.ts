import { appState } from '#lib/app/state.js';
import { commands } from '#lib/bindings.js';

export type DockSide = 'left' | 'right';

interface Stored {
	side: DockSide;
	/** How far down the space it can move in the dock sits, from 0 at the top to 1 at the bottom. */
	along: number;
}

/**
 * Where the floating dock of tools sits over the paper: on the side away
 * from the hand that writes unless it was moved, and how far down.
 */
class Dock {
	side: DockSide = $state('left');
	along = $state(0.5);

	async load() {
		const stored = appState.get<Stored>('dock');
		if (stored) {
			this.side = stored.side;
			this.along = stored.along;
		} else {
			this.side = (await commands.penHand()) === 'left' ? 'right' : 'left';
		}
	}

	place(side: DockSide, along: number) {
		this.side = side;
		this.along = Math.min(1, Math.max(0, along));
		void appState.save({ dock: { side: this.side, along: this.along } });
	}
}

export const dock = new Dock();
