import { toast } from '$lib/state/toast.svelte';
import { EMPTY, saveLayout, tryLayout, type Layout, type Levels, type Symbol } from './api';
import { guessGeometry, type Geometry } from './geometry';

const SAVE_DELAY = 400;
const TRY_DELAY = 120;
const GEOMETRY_KEY = 'keys.geometry.';

function rememberedGeometry(layout: Layout): Geometry {
	const stored = localStorage.getItem(GEOMETRY_KEY + layout.id);
	return stored === 'ansi' || stored === 'iso' || stored === 'jis' ? stored : guessGeometry(layout.base);
}

export class LayoutEditor {
	layout = $state<Layout>() as Layout;
	selected = $state('AC01');
	level = $state(0);
	geometry = $state<Geometry>('iso');
	pressed = $state.raw<Set<string>>(new Set());
	saved = $state(true);

	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#tryTimer: ReturnType<typeof setTimeout> | undefined;
	#onsaved: () => void;

	constructor(layout: Layout, onsaved: () => void) {
		this.layout = layout;
		this.geometry = rememberedGeometry(layout);
		this.#onsaved = onsaved;
		void tryLayout(layout);
	}

	levels(name: string): Levels {
		return this.layout.keys[name] ?? [EMPTY, EMPTY, EMPTY, EMPTY];
	}

	get usesThirdLevel() {
		return Object.values(this.layout.keys).some((levels) => levels[2].kind !== 'empty' || levels[3].kind !== 'empty');
	}

	select(name: string, level = this.level) {
		this.selected = name;
		this.level = level;
	}

	assign(symbol: Symbol, name = this.selected, level = this.level) {
		const levels = [...this.levels(name)] as Levels;
		levels[level] = symbol;
		this.layout.keys[name] = levels;
		this.changed();
	}

	setGeometry(geometry: Geometry) {
		this.geometry = geometry;
		localStorage.setItem(GEOMETRY_KEY + this.layout.id, geometry);
	}

	changed() {
		this.saved = false;
		clearTimeout(this.#saveTimer);
		clearTimeout(this.#tryTimer);
		this.#saveTimer = setTimeout(() => void this.save(), SAVE_DELAY);
		this.#tryTimer = setTimeout(() => void tryLayout($state.snapshot(this.layout)), TRY_DELAY);
	}

	discard() {
		clearTimeout(this.#saveTimer);
		this.saved = true;
	}

	async save() {
		clearTimeout(this.#saveTimer);
		if (this.saved) return;
		try {
			await saveLayout($state.snapshot(this.layout));
			this.saved = true;
			this.#onsaved();
		} catch (error) {
			toast.failed(error);
		}
	}
}
