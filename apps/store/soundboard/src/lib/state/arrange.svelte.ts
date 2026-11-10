import { tick } from 'svelte';
import { reorder } from '@luft/ui';
import { app } from './app.svelte';

type Grid = { columns: number; stepX: number; stepY: number };
type Drag = { from: number; to: number; grid: Grid };

const STEPS: Record<string, (grid: Grid) => number> = {
	ArrowLeft: () => -1,
	ArrowRight: () => 1,
	ArrowUp: (grid) => -grid.columns,
	ArrowDown: (grid) => grid.columns
};

function measure(slot: HTMLElement): Grid {
	const style = getComputedStyle(slot.parentElement!);
	return {
		columns: style.gridTemplateColumns.split(' ').length,
		stepX: slot.offsetWidth + parseFloat(style.columnGap),
		stepY: slot.offsetHeight + parseFloat(style.rowGap)
	};
}

const column = (grid: Grid, index: number) => index % grid.columns;
const row = (grid: Grid, index: number) => Math.floor(index / grid.columns);

function between(grid: Grid, from: number, to: number) {
	return { x: (column(grid, to) - column(grid, from)) * grid.stepX, y: (row(grid, to) - row(grid, from)) * grid.stepY };
}

class Arrangement {
	on = $state(false);
	drag = $state.raw<Drag | null>(null);
	offset = $state.raw({ x: 0, y: 0 });
	dropping = $state(false);
	moved = $state.raw<{ name: string; position: number; count: number } | null>(null);
	active = $derived(this.on && !app.search);
	#placed = false;

	toggle = () => {
		this.on = !this.on;
		this.moved = null;
	};

	grab(event: PointerEvent, index: number) {
		if (event.button !== 0 || this.drag) return;
		const slot = (event.currentTarget as HTMLElement).parentElement!;
		const scroller = slot.parentElement!.parentElement!;
		const grid = measure(slot);
		const start = { x: event.clientX, y: event.clientY, scroll: scroller.scrollTop };
		let pointer = { x: start.x, y: start.y };
		const follow = () => {
			const x = pointer.x - start.x;
			const y = pointer.y - start.y + scroller.scrollTop - start.scroll;
			const overColumn = Math.min(Math.max(Math.round(column(grid, index) + x / grid.stepX), 0), grid.columns - 1);
			const overRow = Math.max(Math.round(row(grid, index) + y / grid.stepY), 0);
			this.offset = { x, y };
			this.drag = { from: index, to: Math.min(overRow * grid.columns + overColumn, app.sounds.length - 1), grid };
		};
		const move = (moved: PointerEvent) => {
			pointer = { x: moved.clientX, y: moved.clientY };
			follow();
		};
		const finish = (ended: PointerEvent) => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', finish);
			window.removeEventListener('pointercancel', finish);
			scroller.removeEventListener('scroll', follow);
			if (ended.type === 'pointerup') void this.#drop(slot);
			else this.drag = null;
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', finish);
		window.addEventListener('pointercancel', finish);
		scroller.addEventListener('scroll', follow, { passive: true });
		this.offset = { x: 0, y: 0 };
		this.drag = { from: index, to: index, grid };
	}

	async #drop(slot: HTMLElement) {
		const { from, to, grid } = this.drag!;
		this.dropping = true;
		this.offset = between(grid, from, to);
		await tick();
		await Promise.allSettled(slot.getAnimations().map((animation) => animation.finished));
		this.#placed = true;
		this.#move(from, to);
		this.drag = null;
		this.dropping = false;
		await tick();
		this.#placed = false;
	}

	key(event: KeyboardEvent, index: number) {
		if (event.key === 'Escape') return this.toggle();
		const step = STEPS[event.key];
		if (!step) return;
		event.preventDefault();
		const tile = event.currentTarget as HTMLElement;
		const to = Math.min(Math.max(index + step(measure(tile.parentElement!)), 0), app.sounds.length - 1);
		if (to === index) return;
		const { name } = app.sounds[index];
		this.#move(index, to);
		this.moved = { name, position: to + 1, count: app.sounds.length };
		void tick().then(() => tile.focus());
	}

	#move(from: number, to: number) {
		if (from === to) return;
		const sounds = [...app.sounds];
		sounds.splice(to, 0, ...sounds.splice(from, 1));
		app.reorder(sounds);
	}

	shift(index: number) {
		if (!this.drag) return undefined;
		const { from, to, grid } = this.drag;
		if (index === from) return `${this.offset.x}px ${this.offset.y}px`;
		const preview = index > from && index <= to ? index - 1 : index < from && index >= to ? index + 1 : index;
		if (preview === index) return undefined;
		const { x, y } = between(grid, index, preview);
		return `${x}px ${y}px`;
	}

	settle = (node: Element, rects: { from: DOMRect; to: DOMRect }) => (this.#placed ? {} : reorder(node, rects));
}

export const arrangement = new Arrangement();
