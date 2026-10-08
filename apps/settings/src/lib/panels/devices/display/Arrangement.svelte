<script lang="ts">
	import { snap, type Rect } from './layout';

	interface Item extends Rect {
		name: string;
		primary: boolean;
	}

	interface View {
		scale: number;
		left: number;
		top: number;
	}

	interface Drag {
		id: string;
		pointerX: number;
		pointerY: number;
		x: number;
		y: number;
		moved: boolean;
		view: View;
	}

	interface Props {
		items: Item[];
		selected: string;
		onselect: (id: string) => void;
		onmove: (id: string, x: number, y: number) => void;
	}

	const HEIGHT = 240;
	const PADDING = 32;
	const DRAG_THRESHOLD = 4;

	let { items, selected, onselect, onmove }: Props = $props();

	let width = $state(0);
	let drag = $state<Drag | null>(null);

	let view = $derived(drag?.view ?? fit(items, width));

	function fit(rects: Rect[], available: number): View {
		const left = Math.min(...rects.map((rect) => rect.x));
		const top = Math.min(...rects.map((rect) => rect.y));
		const spanX = Math.max(...rects.map((rect) => rect.x + rect.width)) - left;
		const spanY = Math.max(...rects.map((rect) => rect.y + rect.height)) - top;
		const scale = Math.max(0, Math.min((available - PADDING * 2) / spanX, (HEIGHT - PADDING * 2) / spanY));
		return {
			scale,
			left: (available - spanX * scale) / 2 - left * scale,
			top: (HEIGHT - spanY * scale) / 2 - top * scale
		};
	}

	function placement(item: Item) {
		const moving = drag?.id === item.id ? drag : item;
		return {
			left: view.left + moving.x * view.scale,
			top: view.top + moving.y * view.scale,
			width: item.width * view.scale,
			height: item.height * view.scale
		};
	}

	function pointerDown(event: PointerEvent, item: Item) {
		if (event.button !== 0) return;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = { id: item.id, pointerX: event.clientX, pointerY: event.clientY, x: item.x, y: item.y, moved: false, view };
	}

	function pointerMove(event: PointerEvent, item: Item) {
		if (!drag) return;
		const deltaX = event.clientX - drag.pointerX;
		const deltaY = event.clientY - drag.pointerY;
		if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;
		drag.moved = true;
		drag.x = item.x + deltaX / drag.view.scale;
		drag.y = item.y + deltaY / drag.view.scale;
	}

	function pointerUp() {
		if (!drag) return;
		const { id, moved, x, y } = drag;
		drag = null;
		onselect(id);
		if (!moved) return;
		const placed = snap(items, id, x, y);
		if (placed) onmove(id, placed.x, placed.y);
	}
</script>

<div class="arrangement" bind:clientWidth={width} style:height="{HEIGHT}px">
	{#if width}
		{#each items as item (item.id)}
			{@const box = placement(item)}
			<button
				type="button"
				class="display"
				class:selected={item.id === selected}
				class:dragging={drag?.id === item.id && drag.moved}
				aria-label={item.primary ? `${item.name}, main display` : item.name}
				aria-pressed={item.id === selected}
				style:transform="translate({box.left}px, {box.top}px)"
				style:width="{box.width}px"
				style:height="{box.height}px"
				onpointerdown={(event) => pointerDown(event, item)}
				onpointermove={(event) => pointerMove(event, item)}
				onpointerup={pointerUp}
				onpointercancel={() => (drag = null)}
				onkeydown={(event) => event.key === 'Enter' && onselect(item.id)}
			>
				{#if item.primary}
					<span class="top-bar"></span>
				{/if}
				<span class="truncate">{item.name}</span>
			</button>
		{/each}
	{/if}
</div>

<style>
	.arrangement {
		position: relative;
		overflow: hidden;
		touch-action: none;
	}

	.display {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		border-radius: 12px;
		background: var(--control);
		font-size: 13px;
		font-weight: 500;
		color: var(--text-soft);
		transition:
			transform 260ms var(--ease),
			width 260ms var(--ease),
			height 260ms var(--ease),
			background-color 160ms var(--ease),
			box-shadow 160ms var(--ease);
	}

	.display:hover {
		background: var(--control-hover);
	}

	.display.selected {
		color: var(--text);
		box-shadow: inset 0 0 0 2px var(--accent);
	}

	.display.dragging {
		z-index: 1;
		background: var(--control-hover);
		box-shadow:
			inset 0 0 0 2px var(--accent),
			0 12px 32px var(--shadow-soft);
		transition: none;
	}

	.top-bar {
		position: absolute;
		top: 6px;
		right: 8px;
		left: 8px;
		height: 3px;
		border-radius: var(--radius-pill);
		background: var(--text-muted);
		opacity: 0.5;
	}
</style>
