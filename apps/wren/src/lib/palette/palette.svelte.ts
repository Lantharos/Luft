export interface PaletteItem {
	key: string;
	label: string;
	detail?: string;
	hint?: string;
	labelMatches?: number[];
	detailMatches?: number[];
	checked?: boolean;
	run: () => void;
}

export interface PaletteSource {
	placeholder: string;
	items: (query: string) => PaletteItem[];
	empty?: string;
}

export class Palette {
	open = $state(false);
	query = $state('');
	source = $state.raw<PaletteSource | null>(null);

	show(source: PaletteSource, query = '') {
		this.source = source;
		this.query = query;
		this.open = true;
	}

	close() {
		this.open = false;
	}
}
