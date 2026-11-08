<script lang="ts">
	import { onMount } from 'svelte';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { pageSize, paperOf } from '#lib/library/model.js';
	import { LOOKS } from '#lib/paper/templates.js';
	import type { PageStore } from '#lib/page/storage.js';
	import { pagesIn, stack } from './layout';
	import { LiveInk } from './live';
	import PageView from './PageView.svelte';
	import { Surface } from './surface';
	import type { Viewport } from './viewport.svelte';

	let { notebook, viewport }: { notebook: OpenNotebook; viewport: Viewport } = $props();

	let element: HTMLDivElement;
	let liveCanvas: HTMLCanvasElement;
	let predictCanvas: HTMLCanvasElement;
	let scale = $state(window.devicePixelRatio || 1);
	let preview = $state({ scale: 1, x: 0, y: 0 });
	let surface: Surface;
	let live: LiveInk;
	const stores = new Map<string, PageStore>();

	$effect(() => {
		viewport.layout = stack(notebook.meta.pages.map((page) => pageSize(paperOf(notebook.meta, page), page)));
		viewport.clamp();
	});

	let range = $derived.by(() => {
		const { y, zoom, height } = viewport;
		const [first, last] = pagesIn(viewport.layout, y / zoom, (y + height) / zoom);
		return [Math.max(0, first - 1), Math.min(viewport.layout.pages.length - 1, last + 1)];
	});

	function visibleIn(index: number) {
		const page = viewport.layout.pages[index];
		const left = page.left * viewport.zoom - viewport.x;
		const top = page.top * viewport.zoom - viewport.y;
		const width = page.width * viewport.zoom;
		const height = page.height * viewport.zoom;
		return {
			left: Math.max(0, Math.min(width, -left)),
			top: Math.max(0, Math.min(height, -top)),
			right: Math.max(0, Math.min(width, viewport.width - left)),
			bottom: Math.max(0, Math.min(height, viewport.height - top))
		};
	}

	onMount(() => {
		live = new LiveInk(liveCanvas, predictCanvas);
		surface = new Surface(element, viewport, live, {
			target(index) {
				const entry = notebook.meta.pages[index];
				const store = entry && stores.get(entry.id);
				if (!store) return null;
				return { page: viewport.layout.pages[index], document: store.document, ink: { dark: LOOKS[paperOf(notebook.meta, entry).color].dark } };
			},
			preview(scale, x, y) {
				preview = { scale, x, y };
			},
			undo: () => notebook.undo(),
			redo: () => notebook.redo()
		});
		const raw = (event: Event) => surface.rawUpdate(event as PointerEvent);
		element.addEventListener('pointerrawupdate', raw);
		const media = matchMedia(`(resolution: ${scale}dppx)`);
		const rescale = () => (scale = window.devicePixelRatio || 1);
		media.addEventListener('change', rescale);
		return () => {
			media.removeEventListener('change', rescale);
			element.removeEventListener('pointerrawupdate', raw);
		};
	});

	$effect(() => live?.resize(viewport.width, viewport.height, scale));
</script>

<div
	class="canvas relative min-h-0 flex-1 overflow-hidden"
	bind:this={element}
	bind:clientWidth={viewport.width}
	bind:clientHeight={viewport.height}
	onpointerdown={(event) => surface.down(event)}
	onpointermove={(event) => surface.move(event)}
	onpointerup={(event) => surface.up(event)}
	onpointercancel={(event) => surface.cancel(event)}
	onwheel={(event) => surface.wheel(event)}
	oncontextmenu={(event) => event.preventDefault()}
	role="application"
>
	<div
		class="content absolute left-0 top-0"
		style:transform="translate({preview.x}px, {preview.y}px) scale({preview.scale}) translate({-viewport.x}px, {-viewport.y}px)"
	>
		{#each notebook.meta.pages.slice(range[0], range[1] + 1) as entry, offset (entry.id)}
			{@const index = range[0] + offset}
			<PageView
				{notebook}
				{entry}
				rect={viewport.layout.pages[index]}
				zoom={viewport.zoom}
				{scale}
				visible={visibleIn(index)}
				onready={(id, store) => stores.set(id, store)}
			/>
		{/each}
	</div>
	<canvas class="live" bind:this={liveCanvas}></canvas>
	<canvas class="live" bind:this={predictCanvas}></canvas>
</div>

<style>
	.canvas {
		touch-action: none;
		background: var(--app-bg);
		user-select: none;
	}

	.content {
		transform-origin: 0 0;
		will-change: transform;
	}

	.live {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
