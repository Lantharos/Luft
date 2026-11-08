<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte';
	import { appearance } from '@luft/ui';
	import { carry } from '#lib/drag/carry.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { pageSize, paperOf } from '#lib/library/model.js';
	import { LOOKS } from '#lib/paper/templates.js';
	import { sourcePath } from '#lib/pdf/sources.js';
	import TextActions from '#lib/pdf/TextActions.svelte';
	import SelectionBox from '#lib/selection/SelectionBox.svelte';
	import type { PageStore } from '#lib/page/storage.js';
	import { Converter } from '#lib/convert/converter.svelte.js';
	import type { Page } from '#lib/convert/writing.js';
	import type { Stroke } from '#lib/ink/stroke.js';
	import { draftText, editing } from '#lib/objects/editing.svelte.js';
	import { linesOf } from '#lib/typing/flow.js';
	import { carryZone } from './carried';
	import { pagesIn, stack } from './layout';
	import { LiveInk } from './live';
	import PageView from './PageView.svelte';
	import { Surface } from './input/surface';
	import RulerView from './ruler/Ruler.svelte';
	import type { Ruler } from './ruler/ruler.svelte';
	import type { Viewport } from './viewport.svelte';

	let { notebook, viewport, ruler, onquote }: { notebook: OpenNotebook; viewport: Viewport; ruler: Ruler; onquote?: (text: string) => void } = $props();

	let element: HTMLDivElement;
	let liveCanvas: HTMLCanvasElement;
	let predictCanvas: HTMLCanvasElement;
	let scale = $state(window.devicePixelRatio || 1);
	let preview = $state({ scale: 1, x: 0, y: 0 });
	let surface: Surface;
	let live: LiveInk;
	const stores = new Map<string, PageStore>();

	setContext('pages', {
		get notebook() {
			return notebook;
		},
		get viewport() {
			return viewport;
		}
	});

	function pageFor(id: string): Page | null {
		const index = notebook.indexOf(id);
		const store = stores.get(id);
		const page = element.querySelector<HTMLElement>(`[data-page="${id}"]`);
		if (index < 0 || !store || !page) return null;
		const rect = viewport.layout.pages[index];
		return { id, document: store.document, element: page, width: rect.width, lines: linesOf(notebook, notebook.meta.pages[index]), zoom: viewport.zoom };
	}

	const converter = new Converter({ page: pageFor, writing: () => surface.writing });

	function convertPicked(id: string, strokes: Stroke[]) {
		const page = pageFor(id);
		if (page) void converter.convertNow(page, strokes);
	}

	/** Puts the caret where a click or tap landed: into text that's there, or on a new line of the page. */
	function typeAt(id: string, x: number, y: number, client: [number, number]) {
		const index = notebook.indexOf(id);
		const store = stores.get(id);
		if (!store) return;
		const objects = store.document.objects;
		const hit = objects.find((object) => object.kind === 'text' && x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height);
		const flowing = notebook.meta.typed ? objects.find((object) => object.flow) : undefined;
		if (hit ?? flowing) {
			editing.focus = { id: (hit ?? flowing)!.id, at: client };
			return;
		}
		draftText(id, linesOf(notebook, notebook.meta.pages[index]), x, y, viewport.layout.pages[index].width, notebook.meta.typed);
	}

	$effect(() => {
		viewport.layout = stack(notebook.meta.pages.map((page) => pageSize(paperOf(notebook.meta, page), page)));
		untrack(() => viewport.clamp());
	});

	let lastWidth = 0;

	$effect(() => {
		const width = viewport.width;
		untrack(() => {
			const page = viewport.layout.pages[0];
			const fitted = page && Math.abs(viewport.zoom - (lastWidth - 64) / page.width) < viewport.zoom * 0.02;
			if (lastWidth && width && fitted) viewport.fitWidth(page);
			else viewport.clamp();
		});
		lastWidth = width;
	});

	let range = $derived.by(() => {
		const { y, zoom, height, single } = viewport;
		if (single !== null) return [single, single];
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
				return {
					id: entry.id,
					page: viewport.layout.pages[index],
					document: store.document,
					ink: { dark: LOOKS[paperOf(notebook.meta, entry).color].dark },
					pdf: entry.pdf && { path: sourcePath(notebook, entry.pdf.source), index: entry.pdf.index }
				};
			},
			preview(scale, x, y) {
				preview = { scale, x, y };
			},
			ruler: () => ruler,
			typeAt: (target, x, y, client) => typeAt(target.id, x, y, client),
			wrote: (target, stroke) => converter.wrote(target.id, stroke),
			undo: () => notebook.undo(),
			redo: () => notebook.redo()
		});
		const leave = carry.zone(carryZone(element, viewport, notebook, stores));
		const raw = (event: Event) => surface.rawUpdate(event as PointerEvent);
		element.addEventListener('pointerrawupdate', raw);
		const media = matchMedia(`(resolution: ${scale}dppx)`);
		const rescale = () => (scale = window.devicePixelRatio || 1);
		media.addEventListener('change', rescale);
		return () => {
			converter.destroy();
			leave();
			media.removeEventListener('change', rescale);
			element.removeEventListener('pointerrawupdate', raw);
		};
	});

	$effect(() => live?.resize(viewport.width, viewport.height, scale));

	function keepAboveKeyboard(event: FocusEvent) {
		const target = event.target as HTMLElement;
		if (appearance.posture !== 'tablet' || !target.isContentEditable) return;
		const top = target.getBoundingClientRect().top - element.getBoundingClientRect().top;
		if (top > viewport.height * 0.35) viewport.panBy(0, top - viewport.height * 0.2);
	}
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
	onfocusin={keepAboveKeyboard}
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
	{#if ruler.shown}
		<RulerView {ruler} zoom={viewport.zoom} />
	{/if}
	<TextActions {notebook} {viewport} {onquote} />
	<SelectionBox {notebook} {viewport} ready={converter.ready} onconvert={convertPicked} />
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
