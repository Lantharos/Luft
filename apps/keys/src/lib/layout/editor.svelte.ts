import { History } from '$lib/state/history.svelte';
import { toast } from '$lib/state/toast.svelte';
import { guessGeometry, type Geometry } from '$lib/keyboard/geometry';
import { EMPTY, freeKeysym, saveLayout, systemTable, tryLayout, type DeadKey, type Layout, type Levels, type Options, type Pair, type Symbol } from './api';
import { capitals, deadSymbol, placements, standardName } from './dead/table';

const SAVE_DELAY = 400;
const TRY_DELAY = 120;
const GEOMETRY_KEY = 'keys.geometry.';

export type Tab = 'keys' | 'dead' | 'settings';

function rememberedGeometry(layout: Layout): Geometry {
	const stored = localStorage.getItem(GEOMETRY_KEY + layout.id);
	return stored === 'ansi' || stored === 'iso' || stored === 'jis' ? stored : guessGeometry(layout.base);
}

export class LayoutEditor {
	layout = $state<Layout>() as Layout;
	tab = $state<Tab>('keys');
	selected = $state('AC01');
	level = $state(0);
	layer = $state<number | null>(null);
	geometry = $state<Geometry>('iso');
	pressed = $state.raw<Set<string>>(new Set());
	chosenDead = $state<string | null>(null);
	placing = $state<string | null>(null);
	saved = $state(true);
	readonly history = new History<Layout>();

	#saveTimer: ReturnType<typeof setTimeout> | undefined;
	#tryTimer: ReturnType<typeof setTimeout> | undefined;
	#onsaved: () => void;

	constructor(layout: Layout, onsaved: () => void) {
		this.layout = layout;
		this.geometry = rememberedGeometry(layout);
		this.chosenDead = layout.dead[0]?.keysym ?? this.systemDead[0]?.keysym ?? null;
		this.#onsaved = onsaved;
		void tryLayout(layout);
	}

	levels(name: string): Levels {
		return this.layout.keys[name] ?? [EMPTY, EMPTY, EMPTY, EMPTY];
	}

	get usesThirdLevel() {
		return Object.values(this.layout.keys).some((levels) => levels[2].kind !== 'empty' || levels[3].kind !== 'empty');
	}

	get systemDead(): Symbol[] {
		const seen = new Map<string, Symbol>();
		for (const symbol of Object.values(this.layout.keys).flat()) {
			if (symbol.kind === 'dead' && !this.dead(symbol.keysym) && !seen.has(symbol.keysym)) seen.set(symbol.keysym, symbol);
		}
		return [...seen.values()];
	}

	dead(keysym: string | null) {
		return this.layout.dead.find((key) => key.keysym === keysym);
	}

	select(name: string, level = this.layer ?? this.level) {
		this.selected = name;
		this.level = level;
	}

	setGeometry(geometry: Geometry) {
		this.geometry = geometry;
		localStorage.setItem(GEOMETRY_KEY + this.layout.id, geometry);
	}

	#edit(key: string, apply: () => void) {
		this.history.record($state.snapshot(this.layout), key);
		apply();
		this.changed();
	}

	assign(symbol: Symbol, name = this.selected, level = this.level) {
		this.#edit(`key:${name}:${level}:${symbol.keysym}`, () => {
			const levels = [...this.levels(name)] as Levels;
			levels[level] = symbol;
			this.layout.keys[name] = levels;
		});
	}

	place(keysym: string, name: string, level: number) {
		const key = this.dead(keysym);
		if (key) this.assign(deadSymbol(key), name, level);
		this.placing = null;
	}

	rename(field: 'name' | 'short' | 'language', value: string) {
		this.#edit(`detail:${field}`, () => (this.layout[field] = value));
	}

	setOption<K extends keyof Options>(option: K, value: Options[K]) {
		this.#edit(`option:${option}`, () => (this.layout.options[option] = value));
	}

	#freeKeysym() {
		return freeKeysym(this.layout.id, this.layout.dead.map((key) => key.keysym));
	}

	#replaceOnKeys(keysym: string, symbol: Symbol) {
		for (const [name, levels] of Object.entries(this.layout.keys)) {
			if (levels.some((level) => level.keysym === keysym)) this.layout.keys[name] = levels.map((level) => (level.keysym === keysym ? symbol : level)) as Levels;
		}
	}

	async addDead() {
		const keysym = await this.#freeKeysym();
		const name = `Dead key ${this.layout.dead.length + 1}`;
		this.#edit('dead:add', () => this.layout.dead.push({ keysym, name, symbol: '◌', spacing: '', pairs: [] }));
		this.chosenDead = keysym;
		return keysym;
	}

	async copySystem(symbol: Symbol) {
		const [table, keysym] = await Promise.all([systemTable(symbol.keysym), this.#freeKeysym()]);
		const copy: DeadKey = { keysym, name: standardName(symbol.keysym), symbol: symbol.text, spacing: table.spacing, pairs: table.pairs };
		this.#edit('dead:copy', () => {
			this.layout.dead.push(copy);
			this.#replaceOnKeys(symbol.keysym, deadSymbol(copy));
		});
		this.chosenDead = keysym;
	}

	updateDead(keysym: string, field: 'name' | 'symbol' | 'spacing', value: string) {
		this.#edit(`dead:${keysym}:${field}`, () => {
			const key = this.dead(keysym);
			if (!key) return;
			key[field] = value;
			if (field === 'symbol') this.#replaceOnKeys(keysym, deadSymbol(key));
		});
	}

	removeDead(keysym: string) {
		this.#edit(`dead:remove:${keysym}`, () => {
			this.layout.dead = this.layout.dead.filter((key) => key.keysym !== keysym);
			for (const key of this.layout.dead) for (const pair of key.pairs) if (pair.next === keysym) pair.next = undefined;
			this.#replaceOnKeys(keysym, EMPTY);
		});
		this.chosenDead = this.layout.dead[0]?.keysym ?? null;
	}

	addPair(keysym: string, pair: Pair = { base: '', text: '' }) {
		this.#edit(`pair:add:${keysym}`, () => this.dead(keysym)?.pairs.push(pair));
	}

	updatePair(keysym: string, index: number, change: Partial<Pair>) {
		this.#edit(`pair:${keysym}:${index}:${Object.keys(change).join()}`, () => {
			const pair = this.dead(keysym)?.pairs[index];
			if (pair) Object.assign(pair, change);
		});
	}

	removePair(keysym: string, index: number) {
		this.#edit(`pair:remove:${keysym}`, () => this.dead(keysym)?.pairs.splice(index, 1));
	}

	addCapitals(keysym: string) {
		const key = this.dead(keysym);
		if (!key) return;
		const added = capitals(key.pairs);
		if (added.length) this.#edit(`pair:capitals:${keysym}`, () => key.pairs.push(...added));
		toast.show(added.length ? `Added ${added.length} capital ${added.length === 1 ? 'letter' : 'letters'}` : 'Every letter already has its capital');
	}

	placesOf(keysym: string) {
		return placements(this.layout.keys, keysym);
	}

	undo() {
		const previous = this.history.undo($state.snapshot(this.layout));
		if (previous) this.#restore(previous);
	}

	redo() {
		const next = this.history.redo($state.snapshot(this.layout));
		if (next) this.#restore(next);
	}

	#restore(layout: Layout) {
		this.layout = layout;
		if (!this.dead(this.chosenDead)) this.chosenDead = layout.dead[0]?.keysym ?? null;
		this.changed();
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
