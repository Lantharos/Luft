<script lang="ts">
	import { untrack } from 'svelte';
	import { fileUrl } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { Dialog } from '@luft/ui';
	import { WHOLE, type Crop, type PageObject } from '#lib/page/objects.js';
	import { cropped, dragCrop, type Edge } from './crop';

	let { object, src, onclose, onchange }: { object: PageObject; src: string; onclose: () => void; onchange: (next: PageObject) => void } = $props();

	let crop: Crop = $state({ ...(untrack(() => object.crop) ?? WHOLE) });
	let natural = $state({ width: 0, height: 0 });
	let area: HTMLDivElement;
	let dragging: { edge: Edge; x: number; y: number; start: Crop; id: number } | null = null;

	function grab(event: PointerEvent, edge: Edge) {
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = { edge, x: event.clientX, y: event.clientY, start: { ...crop }, id: event.pointerId };
	}

	function move(event: PointerEvent) {
		if (dragging?.id !== event.pointerId) return;
		const rect = area.getBoundingClientRect();
		crop = dragCrop(dragging.start, dragging.edge, (event.clientX - dragging.x) / rect.width, (event.clientY - dragging.y) / rect.height);
	}

	function done() {
		onchange(cropped(object, crop, natural));
		onclose();
	}

	const EDGES: Edge[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
</script>

<Dialog title={t('crop-title')} wide {onclose}>
	<div class="stage">
		<div class="area" bind:this={area} style:aspect-ratio={natural.width && `${natural.width} / ${natural.height}`}>
			<img
				src={fileUrl(src)}
				alt=""
				draggable="false"
				onload={(event) => {
					const image = event.currentTarget as HTMLImageElement;
					natural = { width: image.naturalWidth, height: image.naturalHeight };
				}}
			/>
			<div
				class="window"
				role="presentation"
				style:left="{crop.x * 100}%"
				style:top="{crop.y * 100}%"
				style:width="{crop.width * 100}%"
				style:height="{crop.height * 100}%"
				onpointerdown={(event) => grab(event, 'move')}
				onpointermove={move}
				onpointerup={() => (dragging = null)}
				onpointercancel={() => (dragging = null)}
			>
				{#each EDGES as edge (edge)}
					<span class="handle {edge}" role="presentation" onpointerdown={(event) => grab(event, edge)} onpointermove={move} onpointerup={() => (dragging = null)}></span>
				{/each}
			</div>
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={() => (crop = { ...WHOLE })}>{t('crop-reset')}</button>
		<span class="flex-1"></span>
		<button type="button" class="button" onclick={onclose}>{t('dialog-cancel')}</button>
		<button type="button" class="button primary" disabled={!natural.width} onclick={done}>{t('crop-done')}</button>
	{/snippet}
</Dialog>

<style>
	.stage {
		display: grid;
		height: min(56vh, 460px);
		place-items: center;
	}

	.area {
		position: relative;
		max-height: 100%;
		max-width: 100%;
		overflow: hidden;
		touch-action: none;
		user-select: none;
	}

	.area img {
		display: block;
		max-height: min(56vh, 460px);
		max-width: 100%;
	}

	.window {
		position: absolute;
		cursor: move;
		outline: 2px solid white;
		box-shadow: 0 0 0 9999px color-mix(in oklab, black 52%, transparent);
	}

	.handle {
		position: absolute;
		height: 22px;
		width: 22px;
		border-radius: var(--radius-pill);
		background: white;
		box-shadow: 0 2px 8px var(--shadow-soft);
	}

	:global([data-posture='tablet']) .handle {
		height: 32px;
		width: 32px;
	}

	.top-left {
		left: 3px;
		top: 3px;
		cursor: nwse-resize;
	}

	.top-right {
		right: 3px;
		top: 3px;
		cursor: nesw-resize;
	}

	.bottom-left {
		bottom: 3px;
		left: 3px;
		cursor: nesw-resize;
	}

	.bottom-right {
		right: 3px;
		bottom: 3px;
		cursor: nwse-resize;
	}
</style>
