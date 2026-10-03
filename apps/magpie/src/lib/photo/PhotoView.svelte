<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Item } from '#lib/api.js';
	import { library } from '#lib/library/library.svelte.js';
	import { thumbnails } from '#lib/library/thumbnails.svelte.js';
	import CantShow from '#lib/shell/CantShow.svelte';
	import { activePhoto } from './active.svelte';
	import { photoGestures } from './render/gestures';
	import { cssMatrix } from './render/matrix';
	import { PhotoRenderer } from './render/renderer';
	import { Viewport } from './render/viewport.svelte';
	import { loadPhoto, type PhotoSource } from './source';

	const PLACEHOLDER_DELAY_MS = 120;

	let { item }: { item: Item } = $props();

	const viewport = new Viewport();
	let source = $state.raw<PhotoSource | null>(null);
	let failed = $state(false);
	let placeholder = $state<string | null>(null);
	let canvas = $state<HTMLCanvasElement>();
	let renderer = $state.raw<PhotoRenderer | null>(null);

	let current = $derived(library.current?.path === item.path);
	let matrix = $derived(cssMatrix(viewport.placement));

	$effect(() => {
		const timer = setTimeout(() => (placeholder = source ? null : thumbnails.peek(item)), PLACEHOLDER_DELAY_MS);
		loadPhoto(item).then(
			(loaded) => {
				clearTimeout(timer);
				if (!current) return;
				viewport.setImage(loaded.width, loaded.height);
				source = loaded;
				activePhoto.show(item, viewport, loaded);
			},
			() => {
				clearTimeout(timer);
				failed = true;
			}
		);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (!canvas || !source || source.type === 'element') return;
		const created = new PhotoRenderer(canvas);
		created.upload(source);
		renderer = created;
		return () => {
			created.destroy();
			renderer = null;
		};
	});

	$effect(() => {
		const placement = viewport.placement;
		if (renderer && placement.stageWidth && source) renderer.draw(placement);
	});

	onDestroy(() => activePhoto.clear(viewport));

	function measure(node: HTMLElement) {
		const observer = new ResizeObserver(([entry]) => {
			const { width, height } = entry.contentRect;
			viewport.resize(width, height, devicePixelRatio);
		});
		observer.observe(node);
		return () => observer.disconnect();
	}

	function navigate(direction: 1 | -1) {
		if (current) library.step(direction);
	}
</script>

<div class="photo" class:zoomed={viewport.zoomed} {@attach measure} {@attach photoGestures(viewport, navigate)}>
	{#if failed}
		<CantShow {item} message="This image can't be shown." />
	{:else if source?.type === 'element'}
		<img
			class="element"
			src={source.url}
			alt=""
			draggable="false"
			style:width="{source.width}px"
			style:height="{source.height}px"
			style:transform="matrix({matrix.a}, {matrix.b}, {matrix.c}, {matrix.d}, {matrix.e}, {matrix.f})"
		/>
	{:else if source}
		<canvas bind:this={canvas}></canvas>
	{:else if placeholder}
		<img class="placeholder" src={placeholder} alt="" draggable="false" />
	{/if}
</div>

<style>
	.photo {
		position: absolute;
		inset: 0;
		overflow: hidden;
		touch-action: none;
	}

	.photo.zoomed {
		cursor: grab;
	}

	.photo:global(.dragging) {
		cursor: grabbing;
	}

	canvas {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
	}

	.element {
		position: absolute;
		top: 0;
		left: 0;
		max-width: none;
		transform-origin: 0 0;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		object-fit: contain;
	}
</style>
