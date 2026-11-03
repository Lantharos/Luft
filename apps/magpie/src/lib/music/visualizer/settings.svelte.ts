const KEY = 'magpie.visualizer';

export const STYLES = ['spectrum', 'ring', 'fields'] as const;
export type VisualizerStyle = (typeof STYLES)[number];

export const STYLE_NAMES: Record<VisualizerStyle, string> = {
	spectrum: 'Soft spectrum',
	ring: 'Ring around the cover',
	fields: 'Colour fields'
};

class Visualizer {
	on = $state(false);
	style = $state<VisualizerStyle>('spectrum');
	cover = $state.raw<HTMLElement | null>(null);

	start() {
		const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
		this.on = Boolean(saved?.on);
		if (STYLES.includes(saved?.style)) this.style = saved.style;
	}

	toggle() {
		this.on = !this.on;
		this.#save();
	}

	choose(style: VisualizerStyle) {
		this.style = style;
		this.on = true;
		this.#save();
	}

	#save() {
		localStorage.setItem(KEY, JSON.stringify({ on: this.on, style: this.style }));
	}
}

export const visualizer = new Visualizer();
