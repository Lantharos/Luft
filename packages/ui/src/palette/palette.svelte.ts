import { fuzzyMatch, topMatches } from './fuzzy';

const LIMIT = 80;

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

export class PaletteState {
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

export function matchItems(items: PaletteItem[], query: string): PaletteItem[] {
	const lowered = query.trim().toLowerCase();
	if (!lowered) return items;
	const matched = new Map<string, number[]>();
	return topMatches(items, LIMIT, (item) => {
		const match = fuzzyMatch(lowered, item.label);
		if (match) matched.set(item.key, match.indices);
		return match?.score ?? null;
	}).map((item) => ({ ...item, labelMatches: matched.get(item.key) }));
}
