<script lang="ts">
	import { untrack } from 'svelte';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { paperOf, type PageEntry } from '#lib/library/model.js';
	import PaperBackground from '#lib/paper/PaperBackground.svelte';
	import { library } from '#lib/library/library.svelte.js';
	import ObjectsLayer from '#lib/objects/ObjectsLayer.svelte';
	import type { PageDocument } from '#lib/page/document.js';
	import PdfBackground from '#lib/pdf/PdfBackground.svelte';
	import { textSelection } from '#lib/pdf/selection.svelte.js';
	import { sourcePath } from '#lib/pdf/sources.js';
	import { LOOKS } from '#lib/paper/templates.js';
	import type { PageStore } from '#lib/page/storage.js';
	import { player } from '#lib/recording/player.svelte.js';
	import type { PageRect } from './layout';
	import { TileLayer, type Visible } from './tiles';

	let {
		notebook,
		entry,
		rect,
		zoom,
		scale,
		visible,
		onready
	}: {
		notebook: OpenNotebook;
		entry: PageEntry;
		rect: PageRect;
		zoom: number;
		scale: number;
		visible: Visible;
		onready: (id: string, store: PageStore) => void;
	} = $props();

	let paper = $derived(paperOf(notebook.meta, entry));
	let dark = $derived(LOOKS[paper.color].dark);
	let tilesElement: HTMLDivElement;
	let layer: TileLayer | null = $state(null);
	let document: PageDocument | null = $state.raw(null);

	$effect(() => {
		const id = entry.id;
		const hide = notebook.show(id);
		let created: TileLayer | null = null;
		let alive = true;
		void notebook.load(id).then((store) => {
			if (!alive) return;
			created = new TileLayer(tilesElement, store.document, { dark: untrack(() => dark) });
			layer = created;
			document = store.document;
			onready(id, store);
		});
		return () => {
			alive = false;
			created?.destroy();
			hide();
		};
	});

	$effect(() => layer?.setInk({ dark }));

	$effect(() => layer?.update(zoom, scale, visible));

	$effect(() => layer?.setUnwritten(player.unwrittenIn(notebook)));

</script>

<div
	class="page absolute overflow-hidden"
	style:left="{rect.left * zoom}px"
	style:top="{rect.top * zoom}px"
	style:width="{rect.width * zoom}px"
	style:height="{rect.height * zoom}px"
	data-page={entry.id}
>
	{#if entry.pdf}
		<PdfBackground path={sourcePath(notebook, entry.pdf.source)} index={entry.pdf.index} width={rect.width} {zoom} {scale} />
	{:else}
		<PaperBackground {paper} width={rect.width} height={rect.height} id={entry.id} />
	{/if}
	<div class="tiles absolute inset-0" bind:this={tilesElement}></div>
	{#if document}
		<ObjectsLayer page={entry.id} {document} {zoom} {dark} assets="{library.root}/{notebook.folder}/assets" />
	{/if}
	{#if textSelection.page === entry.id}
		{#each textSelection.selection.rects as rect, index (index)}
			<span
				class="picked"
				style:left="{rect.left * zoom}px"
				style:top="{rect.top * zoom}px"
				style:width="{rect.width * zoom}px"
				style:height="{rect.height * zoom}px"
			></span>
		{/each}
	{/if}
</div>

<style>
	.page {
		background: white;
		border-radius: 3px;
		box-shadow:
			0 0 0 1px var(--hairline),
			0 6px 24px var(--shadow-faint);
		contain: strict;
	}

	.picked {
		position: absolute;
		border-radius: 2px;
		background: color-mix(in oklab, #3d7bd9 30%, transparent);
		pointer-events: none;
	}

	.tiles :global(.ink-tile) {
		position: absolute;
		left: 0;
		top: 0;
		width: 256px;
		height: 256px;
		transform-origin: 0 0;
	}
</style>
