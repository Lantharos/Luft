<script lang="ts">
	import { untrack } from 'svelte';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { paperOf, type PageEntry } from '#lib/library/model.js';
	import PaperBackground from '#lib/paper/PaperBackground.svelte';
	import { LOOKS } from '#lib/paper/templates.js';
	import type { PageStore } from '#lib/page/storage.js';
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

	$effect(() => {
		const id = entry.id;
		const hide = notebook.show(id);
		let created: TileLayer | null = null;
		let alive = true;
		void notebook.load(id).then((store) => {
			if (!alive) return;
			created = new TileLayer(tilesElement, store.document, { dark: untrack(() => dark) });
			layer = created;
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

</script>

<div
	class="page absolute overflow-hidden"
	style:left="{rect.left * zoom}px"
	style:top="{rect.top * zoom}px"
	style:width="{rect.width * zoom}px"
	style:height="{rect.height * zoom}px"
	data-page={entry.id}
>
	<PaperBackground {paper} width={rect.width} height={rect.height} id={entry.id} />
	<div class="tiles absolute inset-0" bind:this={tilesElement}></div>
</div>

<style>
	.page {
		border-radius: 3px;
		box-shadow:
			0 0 0 1px var(--hairline),
			0 6px 24px var(--shadow-faint);
		contain: strict;
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
