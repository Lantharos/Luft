<script lang="ts">
	import { getContext, untrack } from 'svelte';
	import type { PageDocument } from '#lib/page/document.js';
	import type { PageObject } from '#lib/page/objects.js';
	import { tools } from '#lib/tools/tools.svelte.js';
	import CropDialog from './CropDialog.svelte';
	import { editing } from './editing.svelte';
	import Picture from './Picture.svelte';
	import TextBox from './TextBox.svelte';
	import { overflow, type Pages } from '#lib/typing/flow.js';
	import InsertionMark from '#lib/convert/InsertionMark.svelte';

	let { page, document, zoom, dark, assets }: { page: string; document: PageDocument; zoom: number; dark: boolean; assets: string } = $props();

	const pages = getContext<Pages>('pages');

	let objects: PageObject[] = $state.raw(untrack(() => document.objects));
	let moving: { id: string; x: number; y: number; pointer: number; resize: boolean; start: PageObject } | null = null;

	let revision = $state(0);

	$effect(() =>
		document.listen((_, change) => {
			revision++;
			if (change.objects) objects = document.objects;
		})
	);

	let arranging = $derived(tools.active === 'lasso');
	let draft = $derived(editing.draft?.page === page && !objects.some((object) => object.id === editing.draft!.object.id) ? editing.draft.object : null);
	let shown = $derived(draft ? [...objects, draft] : objects);
	let cropping: PageObject | null = $state(null);

	$effect(() => {
		const id = editing.crop;
		if (!id) return;
		const found = objects.find((object) => object.id === id);
		if (!found) return;
		cropping = found;
		editing.crop = null;
	});

	function change(before: PageObject, after: PageObject | null) {
		if (before === draft) {
			if (after) document.commit({ removed: [], added: [], objects: [{ before: null, after }] });
			editing.draft = null;
			return;
		}
		document.commit({ removed: [], added: [], objects: [{ before, after }] });
	}

	function grab(event: PointerEvent, object: PageObject, resize: boolean) {
		if (!arranging) return;
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		moving = { id: object.id, x: event.clientX, y: event.clientY, pointer: event.pointerId, resize, start: object };
	}

	function drag(event: PointerEvent) {
		if (!moving || event.pointerId !== moving.pointer) return;
		const dx = (event.clientX - moving.x) / zoom;
		const dy = (event.clientY - moving.y) / zoom;
		const { start } = moving;
		const next = moving.resize
			? { ...start, width: Math.max(40, start.width + dx), height: Math.max(20, start.height * ((start.width + dx) / start.width)) }
			: { ...start, x: start.x + dx, y: start.y + dy };
		document.preview({ removed: [], added: [], objects: [{ before: objects.find((object) => object.id === start.id)!, after: next }] });
	}

	function drop(event: PointerEvent) {
		if (!moving || event.pointerId !== moving.pointer) return;
		const after = document.object(moving.id)!;
		document.record({ removed: [], added: [], objects: [{ before: moving.start, after }] });
		moving = null;
	}
</script>

<div class="objects" class:dark style:--zoom={zoom}>
	{#each shown as object (object.id)}
		{#if object.kind === 'text'}
			<TextBox
				{object}
				{zoom}
				draft={object === draft}
				editable={editing.active === object.id || object === draft}
				onchange={(next) => change(object, next)}
				onoverflow={(element) => void overflow(pages, page, object, element)}
			/>
		{:else}
			<Picture {object} {zoom} {assets} {arranging} ongrab={(event, resize) => grab(event, object, resize)} onmove={drag} ondrop={drop} oncrop={() => (cropping = object)} />
		{/if}
	{/each}
	<InsertionMark {page} {zoom} {revision} />
	{#if editing.aim?.page === page}
		<span class="aim" style:left="{editing.aim.x * zoom}px" style:top="{editing.aim.y * zoom}px" style:height="{editing.aim.height * zoom}px"></span>
	{/if}
</div>

{#if cropping}
	<CropDialog object={cropping} src="{assets}/{cropping.asset}" onclose={() => (cropping = null)} onchange={(next) => change(cropping!, next)} />
{/if}

<style>
	.objects {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.aim {
		position: absolute;
		width: 2px;
		border-radius: 1px;
		background: #3d7bd9;
		animation: blink 1.1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
</style>
