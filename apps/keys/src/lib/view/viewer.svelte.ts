import type { Board } from '#lib/keyboard/board.js';
import { guessGeometry, type Geometry } from '#lib/keyboard/geometry.js';
import { EMPTY, type Layout, type Levels } from '#lib/layout/api.js';

const GEOMETRY_KEY = 'keys.keyboard';
const SHIFTS = ['LFSH', 'RTSH'];
const LEVEL_THREE = 'RALT';

function rememberedGeometry(primary: string | null): Geometry {
	const stored = localStorage.getItem(GEOMETRY_KEY);
	return stored === 'ansi' || stored === 'iso' || stored === 'jis' ? stored : guessGeometry(primary);
}

function toggled(names: ReadonlySet<string>, name: string, on: boolean) {
	const next = new Set(names);
	if (on) next.add(name);
	else next.delete(name);
	return next;
}

export class LayoutViewer implements Board {
	readonly layout: Layout;
	readonly usesThirdLevel: boolean;
	selected = $state('AC01');
	geometry = $state<Geometry>('iso');
	held = $state.raw<ReadonlySet<string>>(new Set());
	latched = $state.raw<ReadonlySet<string>>(new Set());
	pressed = $derived(new Set([...this.held, ...this.latched]));

	constructor(layout: Layout, primary: string | null) {
		this.layout = layout;
		this.usesThirdLevel = Object.values(layout.keys).some((levels) => levels[2].kind !== 'empty' || levels[3].kind !== 'empty');
		this.geometry = rememberedGeometry(primary);
	}

	get level() {
		return (SHIFTS.some((name) => this.pressed.has(name)) ? 1 : 0) + (this.usesThirdLevel && this.pressed.has(LEVEL_THREE) ? 2 : 0);
	}

	levels(name: string): Levels {
		return this.layout.keys[name] ?? [EMPTY, EMPTY, EMPTY, EMPTY];
	}

	select(name: string) {
		this.selected = name;
	}

	press(name: string, down: boolean) {
		this.held = toggled(this.held, name, down);
	}

	latch(name: string) {
		this.latched = toggled(this.latched, name, !this.latched.has(name));
	}

	release() {
		this.held = new Set();
	}

	setGeometry(geometry: Geometry) {
		this.geometry = geometry;
		localStorage.setItem(GEOMETRY_KEY, geometry);
	}
}
