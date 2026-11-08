<script lang="ts">
	import { untrack } from 'svelte';
	import { fileUrl } from '@lantharos/sabine';
	import type { PageDocument } from '#lib/page/document.js';
	import type { PageObject } from '#lib/page/objects.js';
	import { tools } from '#lib/tools/tools.svelte.js';
	import { editing } from './editing.svelte';
	import TextBox from './TextBox.svelte';

	let { document, zoom, dark, assets }: { document: PageDocument; zoom: number; dark: boolean; assets: string } = $props();

	let objects: PageObject[] = $state.raw(untrack(() => document.objects));
	let moving: { id: string; x: number; y: number; pointer: number; resize: boolean; start: PageObject } | null = null;

	$effect(() => document.listen((_, change) => change.objects && (objects = document.objects)));

	let arranging = $derived(tools.active === 'lasso');

	function change(before: PageObject, after: PageObject | null) {
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
	{#each objects as object (object.id)}
		{#if object.kind === 'text'}
			<TextBox {object} {zoom} editable={tools.active === 'type'} focus={editing.focus === object.id} onchange={(next) => change(object, next)} />
		{:else}
			<div
				class="picture"
				class:arranging
				role="img"
				style:left="{object.x * zoom}px"
				style:top="{object.y * zoom}px"
				style:width="{object.width * zoom}px"
				style:height="{object.height * zoom}px"
				onpointerdown={(event) => grab(event, object, false)}
				onpointermove={drag}
				onpointerup={drop}
			>
				<img src={fileUrl(`${assets}/${object.asset}`)} alt="" draggable="false" />
				{#if arranging}
					<span class="corner" role="presentation" onpointerdown={(event) => grab(event, object, true)}></span>
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.objects {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.dark :global(.text-box) {
		color: #ececea;
	}

	.picture {
		position: absolute;
	}

	.picture img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.picture.arranging {
		pointer-events: auto;
		cursor: move;
		outline: 1.5px dashed #3d7bd9;
		touch-action: none;
	}

	.corner {
		position: absolute;
		right: -9px;
		bottom: -9px;
		height: 18px;
		width: 18px;
		border-radius: var(--radius-pill);
		background: white;
		box-shadow: 0 0 0 1.5px #3d7bd9;
		cursor: nwse-resize;
	}
</style>
