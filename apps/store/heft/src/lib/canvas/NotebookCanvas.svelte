<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte';
	import { appearance } from '@luft/ui';
	import { arrangement } from '#lib/app/arrangement.svelte.js';
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
	import { draftPlace, draftText, editing } from '#lib/objects/editing.svelte.js';
	import FormatBar from '#lib/objects/FormatBar.svelte';
	import { linesOf } from '#lib/typing/flow.js';
	import { player } from '#lib/recording/player.svelte.js';
	import { writtenAt } from '#lib/recording/written.js';
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

	function textAt(id: string, x: number, y: number) {
		const objects = stores.get(id)!.document.objects;
		const hit = objects.find((object) => object.kind === 'text' && x >= object.x && x <= object.x + object.width && y >= object.y && y <= object.y + object.height);
		return hit ?? (notebook.meta.typed ? objects.find((object) => object.flow) : undefined);
	}

	function typeAt(id: string, x: number, y: number, client: [number, number]) {
		const index = notebook.indexOf(id);
		if (!stores.has(id)) return;
		const text = textAt(id, x, y);
		if (text) {
			editing.focus = { id: text.id, at: client };
			return;
		}
		draftText(id, linesOf(notebook, notebook.meta.pages[index]), x, y, viewport.layout.pages[index].width, notebook.meta.typed);
	}

	function aimAt(id: string, x: number, y: number) {
		if (!appearance.keyboard || !stores.has(id)) return;
		const index = notebook.indexOf(id);
		const lines = linesOf(notebook, notebook.meta.pages[index]);
		const text = textAt(id, x, y);
		const draft = draftPlace(lines, x, y);
		editing.aim = {
			page: id,
			x: text ? x : draft.left + 4,
			y: text ? y - lines.step / 2 : draft.top,
			height: text?.line ?? lines.step,
			type: () => {
				const page = viewport.layout.pages[notebook.indexOf(id)];
				const box = element.getBoundingClientRect();
				const [viewX, viewY] = viewport.toView(page.left + x, page.top + y);
				typeAt(id, x, y, [box.left + viewX, box.top + viewY]);
			}
		};
	}

	$effect(() => {
		viewport.layout = stack(notebook.meta.pages.map((page) => pageSize(paperOf(notebook.meta, page), page)), arrangement.tablet ? 0 : undefined);
		untrack(() => viewport.clamp());
	});

	let last = { width: 0, margin: 0 };

	$effect(() => {
		const width = viewport.width;
		const margin = arrangement.margin;
		untrack(() => {
			const page = viewport.layout.pages[0];
			const fit = page && last.width ? (last.width - 2 * last.margin) / page.width : 0;
			const fitted = Math.abs(viewport.zoom - fit) < viewport.zoom * 0.02;
			const zoomedIn = viewport.zoom > fit * 1.02;
			if (fit && width && (fitted || (arrangement.tablet && !zoomedIn))) viewport.fitWidth(page);
			else viewport.clamp();
		});
		last = { width, margin };
	});

	let range = $derived.by(() => {
		const { y, zoom, height, single } = viewport;
		if (single !== null) return [single, single];
		const [first, last] = pagesIn(viewport.layout, y / zoom, (y + height) / zoom);
		return [Math.max(0, first - 1), Math.min(viewport.layout.pages.length - 1, last + 1)];
	});

	const FORMAT_BAR = { width: 172, height: 44, gap: 8 };

	let formatAt = $derived.by(() => {
		const id = editing.active;
		if (!id) return null;
		const draft = editing.draft?.object.id === id ? editing.draft : null;
		for (let index = range[0]; index <= range[1]; index++) {
			const entry = notebook.meta.pages[index];
			const object = draft ? (draft.page === entry.id ? draft.object : undefined) : stores.get(entry.id)?.document.objects.find((candidate) => candidate.id === id);
			if (!object) continue;
			const page = viewport.layout.pages[index];
			const [x, y] = viewport.toView(page.left + object.x, page.top + object.y);
			const above = y - FORMAT_BAR.height - FORMAT_BAR.gap;
			return {
				x: Math.min(Math.max(x, FORMAT_BAR.gap), viewport.width - FORMAT_BAR.width - FORMAT_BAR.gap),
				y: above > FORMAT_BAR.gap ? above : y + (object.line ?? object.height) * viewport.zoom + FORMAT_BAR.gap
			};
		}
		return null;
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
			aim: (target, x, y) => aimAt(target.id, x, y),
			wrote: (target, stroke) => converter.wrote(target.id, stroke),
			undo: () => notebook.undo(),
			redo: () => notebook.redo(),
			tapped(index, x, y) {
				const entry = notebook.meta.pages[index];
				const store = entry && stores.get(entry.id);
				if (!store || !player.openIn(notebook)) return false;
				const written = writtenAt(store.document, x, y, viewport.zoom);
				return written !== null && player.playWritten(notebook, written);
			}
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
	{#if ruler.shown}
		<RulerView {ruler} zoom={viewport.zoom} />
	{/if}
	<TextActions {notebook} {viewport} {onquote} />
	{#if formatAt}
		<FormatBar x={formatAt.x} y={formatAt.y} />
	{/if}
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
