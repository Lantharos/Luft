<script lang="ts" generics="T">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { GridGeometry, type Position, type Rect, type VirtualLayout } from './layout';
	import { animateEnter, animateLeave, animateMoveFrom, animateMoveTo, MAX_STAGGER_MS, motionAllowed } from './motion';

	type Align = 'nearest' | 'center';
	type Rendered = { item: T; position: Position };
	type Ghost = { id: number; item: T; from: Position; to: Position | null };

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		items: T[];
		key: (item: T) => string;
		layout: VirtualLayout;
		overscan?: number;
		stagger?: boolean;
		animateOrder?: boolean;
		stableOrder?: boolean;
		header?: Snippet;
		overlay?: Snippet;
		children: Snippet<[T, number]>;
	}

	let {
		items,
		key,
		layout,
		overscan = 4,
		stagger = false,
		animateOrder = false,
		stableOrder = false,
		header,
		overlay,
		children,
		class: className,
		onscroll,
		...rest
	}: Props = $props();

	let scroller = $state<HTMLDivElement>();
	let content = $state<HTMLDivElement>();
	let headerBox = $state<HTMLDivElement>();
	let width = $state(0);
	let viewport = $state(0);
	let headerHeight = $state(0);
	let scrollTop = $state(0);
	let ghosts = $state.raw<Ghost[]>([]);

	const geometry = $derived(new GridGeometry(layout, width, items.length));
	const firstRow = $derived(Math.max(0, geometry.rowAt(scrollTop - headerHeight) - overscan));
	const lastRow = $derived(Math.min(geometry.rows - 1, geometry.rowAt(scrollTop - headerHeight + viewport) + overscan));
	const start = $derived(firstRow * geometry.columns);
	const visible = $derived(width > 0 ? items.slice(start, Math.min(items.length, (lastRow + 1) * geometry.columns)) : []);
	const placed = $derived(stableOrder ? keepOrder(visible) : visible.map((item, offset) => ({ item, index: start + offset })));

	const elements = new Map<string, HTMLElement>();
	let domOrder: string[] = [];
	let rendered = new Map<string, Rendered>();
	let renderedItems: T[] = [];
	let ghostId = 0;

	$effect(() => {
		const next = new Map<string, Rendered>();
		visible.forEach((item, offset) => next.set(key(item), { item, position: geometry.position(start + offset) }));
		untrack(() => {
			if (animateOrder && items !== renderedItems && motionAllowed()) {
				const previous = { rendered, items: renderedItems, geometry: new GridGeometry(layout, width, renderedItems.length) };
				queueMicrotask(() => reorder(next, previous));
			}
			rendered = next;
			renderedItems = items;
		});
	});

	function keepOrder(list: T[]) {
		const indices = new Map(list.map((item, offset) => [key(item), { item, index: start + offset }]));
		const kept = domOrder.filter((itemKey) => indices.has(itemKey));
		const known = new Set(kept);
		domOrder = [...kept, ...indices.keys().filter((itemKey) => !known.has(itemKey))];
		return domOrder.map((itemKey) => indices.get(itemKey)!);
	}

	export function scrollToIndex(index: number, align: Align = 'nearest') {
		if (!scroller || index < 0 || index >= items.length) return;
		const header = headerBox?.offsetHeight ?? 0;
		const height = scroller.clientHeight;
		const top = header + geometry.position(index).y;
		const bottom = top + geometry.itemHeight;
		if (align === 'center') scroller.scrollTop = top - header - (height - header - geometry.itemHeight) / 2;
		else if (top < scroller.scrollTop + header) scroller.scrollTop = top - header - geometry.gap;
		else if (bottom > scroller.scrollTop + height) scroller.scrollTop = bottom - height + geometry.gap;
	}

	export function contentPoint(clientX: number, clientY: number): Position {
		const box = content?.getBoundingClientRect();
		return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) };
	}

	export function indicesIn(area: Rect) {
		return geometry.indicesIn(area, items.length);
	}

	export function metrics() {
		return { columns: geometry.columns, pageRows: Math.max(1, Math.floor((viewport - headerHeight) / geometry.pitch)) };
	}

	export function element() {
		return scroller;
	}

	function staggerDelay(index: number) {
		const firstVisible = Math.max(0, geometry.rowAt(scrollTop - headerHeight));
		const visibleRows = Math.max(1, Math.ceil(viewport / geometry.pitch));
		const row = Math.floor(index / geometry.columns) - firstVisible;
		const progress = (row + (index % geometry.columns) / geometry.columns) / visibleRows;
		return Math.round(Math.min(1, Math.max(0, progress)) * MAX_STAGGER_MS);
	}

	function track(node: HTMLElement, itemKey: string, index: number) {
		elements.set(itemKey, node);
		if (stagger && motionAllowed()) animateEnter(node, staggerDelay(index));
		return () => {
			if (elements.get(itemKey) === node) elements.delete(itemKey);
		};
	}

	function reorder(next: Map<string, Rendered>, previous: { rendered: Map<string, Rendered>; items: T[]; geometry: GridGeometry }) {
		let previousIndex: Map<string, number> | null = null;
		const previousPosition = (itemKey: string) => {
			const known = previous.rendered.get(itemKey);
			if (known) return known.position;
			previousIndex ??= new Map(previous.items.map((item, index) => [key(item), index]));
			const index = previousIndex.get(itemKey);
			return index === undefined ? null : previous.geometry.position(index);
		};
		for (const [itemKey, { position }] of next) {
			const node = elements.get(itemKey);
			if (!node) continue;
			const from = previousPosition(itemKey);
			if (!from) animateEnter(node);
			else if (from.x !== position.x || from.y !== position.y) animateMoveFrom(node, from.x - position.x, from.y - position.y);
		}
		let nextIndex: Map<string, number> | null = null;
		const leaving: Ghost[] = [];
		for (const [itemKey, { item, position }] of previous.rendered) {
			if (next.has(itemKey)) continue;
			nextIndex ??= new Map(items.map((candidate, index) => [key(candidate), index]));
			const index = nextIndex.get(itemKey);
			leaving.push({ id: ++ghostId, item, from: position, to: index === undefined ? null : geometry.position(index) });
		}
		if (leaving.length > 0) ghosts = [...ghosts, ...leaving];
	}

	function animateGhost(node: HTMLElement, ghost: Ghost) {
		const finished = ghost.to ? animateMoveTo(node, ghost.to.x - ghost.from.x, ghost.to.y - ghost.from.y) : animateLeave(node);
		void finished.then(() => (ghosts = ghosts.filter((candidate) => candidate.id !== ghost.id)));
	}

	function measure(node: HTMLDivElement) {
		width = node.clientWidth;
		viewport = node.clientHeight;
	}

	function handleScroll(event: UIEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		scrollTop = event.currentTarget.scrollTop;
		onscroll?.(event);
	}
</script>

<div
	bind:this={scroller}
	bind:clientWidth={width}
	bind:clientHeight={viewport}
	class={['virtual-scroller', className]}
	onscroll={handleScroll}
	{@attach measure}
	{...rest}
>
	{#if header}
		<div bind:this={headerBox} class="virtual-header" bind:offsetHeight={headerHeight}>{@render header()}</div>
	{/if}
	<div bind:this={content} class="virtual-content" style:height="{geometry.height}px">
		{#each placed as { item, index } (key(item))}
			{@const position = geometry.position(index)}
			<div
				class="virtual-item"
				style:transform="translate3d({position.x}px, {position.y}px, 0)"
				style:width="{geometry.itemWidth}px"
				style:height="{geometry.itemHeight}px"
				{@attach (node) => untrack(() => track(node, key(item), index))}
			>
				{@render children(item, index)}
			</div>
		{/each}
		{#each ghosts as ghost (ghost.id)}
			<div
				class="virtual-item"
				inert
				aria-hidden="true"
				style:transform="translate3d({ghost.from.x}px, {ghost.from.y}px, 0)"
				style:width="{geometry.itemWidth}px"
				style:height="{geometry.itemHeight}px"
				{@attach (node) => untrack(() => animateGhost(node, ghost))}
			>
				{@render children(ghost.item, -1)}
			</div>
		{/each}
		{@render overlay?.()}
	</div>
</div>

<style>
	.virtual-scroller {
		position: relative;
		overflow: auto;
		overscroll-behavior: contain;
	}

	.virtual-header {
		position: sticky;
		top: 0;
		z-index: 2;
	}

	.virtual-content {
		position: relative;
	}

	.virtual-item {
		position: absolute;
		top: 0;
		left: 0;
		contain: layout style;
	}
</style>
