<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import CopyPlus from '@lucide/svelte/icons/copy-plus';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Scissors from '@lucide/svelte/icons/scissors';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import type { Viewport } from '#lib/canvas/viewport.svelte.js';
	import { carry, type Carried } from '#lib/drag/carry.svelte.js';
	import { css, readableOn } from '#lib/ink/color.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { paperOf } from '#lib/library/model.js';
	import { LOOKS } from '#lib/paper/templates.js';
	import { sourcePath } from '#lib/pdf/sources.js';
	import { regionPicture } from './picture';
	import { colorName } from '#lib/tools/colors.js';
	import { SWATCHES } from '#lib/tools/tools.svelte.js';
	import { IDENTITY, selection, type Transform } from './selection.svelte';

	let { notebook, viewport }: { notebook: OpenNotebook; viewport: Viewport } = $props();

	const PAD = 8;

	let box = $derived.by(() => {
		const index = selection.page ? notebook.indexOf(selection.page) : -1;
		const page = viewport.layout.pages[index];
		if (!page || !selection.active) return null;
		const { left, top, right, bottom } = selection.bounds;
		const [x, y] = viewport.toView(page.left + left, page.top + top);
		return { x: x - PAD, y: y - PAD, width: (right - left) * viewport.zoom + PAD * 2, height: (bottom - top) * viewport.zoom + PAD * 2 };
	});

	type Handle = 'move' | 'scale' | 'turn';
	let dragging: { handle: Handle; x: number; y: number; id: number } | null = null;
	let element: HTMLDivElement | undefined = $state();
	let carrying = false;

	/** Takes the picked ink, and on a book the printed part under it, over to the other pane. */
	function startCarrying(event: PointerEvent, canvas: HTMLElement) {
		carrying = true;
		selection.preview(IDENTITY);
		const index = notebook.indexOf(selection.page!);
		const entry = notebook.meta.pages[index];
		const page = viewport.layout.pages[index];
		const rect = canvas.getBoundingClientRect();
		const [x, y] = viewport.toContent(event.clientX - rect.left, event.clientY - rect.top);
		const region = {
			bounds: selection.bounds,
			strokes: selection.strokes,
			ink: { dark: LOOKS[paperOf(notebook.meta, entry).color].dark },
			pageWidth: page.width,
			pdf: entry.pdf && { path: sourcePath(notebook, entry.pdf.source), index: entry.pdf.index }
		};
		const item: Carried = {
			kind: 'ink',
			strokes: selection.strokes,
			bounds: selection.bounds,
			grab: [x - page.left - selection.bounds.left, y - page.top - selection.bounds.top],
			picture: selection.book ? () => regionPicture(region) : null
		};
		carry.start(canvas, item, null);
		void regionPicture(region).then((picture) => {
			if (carry.item === item) carry.preview = picture.toDataURL();
		});
	}

	function follow(event: PointerEvent) {
		const canvas = element!.parentElement!;
		const away = carry.elsewhere(canvas, event.clientX, event.clientY) !== null;
		if (away && !carrying) startCarrying(event, canvas);
		else if (!away && carrying) {
			carrying = false;
			carry.end(false);
		}
		carry.move(event.clientX, event.clientY);
		return carrying;
	}

	function down(event: PointerEvent, handle: Handle) {
		event.stopPropagation();
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		dragging = { handle, x: event.clientX, y: event.clientY, id: event.pointerId };
	}

	function move(event: PointerEvent) {
		if (!dragging || !box || event.pointerId !== dragging.id) return;
		if (dragging.handle === 'move' && follow(event)) return;
		const zoom = viewport.zoom;
		const dx = (event.clientX - dragging.x) / zoom;
		const dy = (event.clientY - dragging.y) / zoom;
		const center = { x: box.width / 2 / zoom, y: box.height / 2 / zoom };
		const next: Transform = { dx: 0, dy: 0, scale: 1, angle: 0 };
		if (dragging.handle === 'move') Object.assign(next, { dx, dy });
		else if (dragging.handle === 'scale') {
			const before = Math.hypot(center.x, center.y);
			next.scale = Math.max(0.1, Math.hypot(center.x + dx, center.y + dy) / before);
		} else next.angle = Math.atan2(dy - center.y, dx) - Math.atan2(-center.y, 0);
		selection.preview(next);
	}

	function up(event: PointerEvent) {
		if (!dragging || event.pointerId !== dragging.id) return;
		dragging = null;
		if (carrying) {
			carrying = false;
			if (carry.end(event.type === 'pointerup')) selection.clear();
			return;
		}
		selection.settle();
	}

	let frame = $derived(selection.transform);
</script>

{#if box}
	<div
		bind:this={element}
		class="box"
		role="group"
		aria-label={t('selection-label')}
		style:left="{box.x}px"
		style:top="{box.y}px"
		style:width="{box.width}px"
		style:height="{box.height}px"
		style:transform="translate({frame.dx * viewport.zoom}px, {frame.dy * viewport.zoom}px) rotate({frame.angle}rad) scale({frame.scale})"
		onpointerdown={(event) => down(event, 'move')}
		onpointermove={move}
		onpointerup={up}
		onpointercancel={up}
	>
		<span class="handle scale" role="presentation" onpointerdown={(event) => down(event, 'scale')}></span>
		<span class="handle turn" role="presentation" onpointerdown={(event) => down(event, 'turn')}><RotateCw size={13} /></span>
	</div>
	{#if selection.ink}
		<div
			class="bar"
			role="toolbar"
			tabindex="-1"
			aria-label={t('selection-actions')}
			style:left="{box.x + box.width / 2}px"
			style:top="{Math.min(box.y + box.height + 14, viewport.height - 60)}px"
			onpointerdown={(event) => event.stopPropagation()}
		>
			{#each SWATCHES.slice(0, 6) as color (color)}
				<button type="button" class="swatch" aria-label={colorName(color)} style:background={css(color)} style:color={readableOn(color)} onclick={() => selection.recolor(color)}></button>
			{/each}
			<span class="mx-1 h-5 w-px bg-(--hairline)"></span>
			<button type="button" class="icon-button" aria-label={t('selection-copy')} {@attach tooltip(t('selection-copy'))} onclick={() => selection.copy()}><Copy size={16} /></button>
			<button type="button" class="icon-button" aria-label={t('selection-cut')} {@attach tooltip(t('selection-cut'))} onclick={() => selection.cut()}><Scissors size={16} /></button>
			<button type="button" class="icon-button" aria-label={t('selection-duplicate')} {@attach tooltip(t('selection-duplicate'))} onclick={() => selection.duplicate()}><CopyPlus size={16} /></button>
			<button type="button" class="icon-button" aria-label={t('selection-delete')} {@attach tooltip(t('selection-delete'))} onclick={() => selection.remove()}><Trash size={16} /></button>
		</div>
	{/if}
{/if}

<style>
	.box {
		position: absolute;
		z-index: 4;
		border-radius: 6px;
		outline: 1.5px dashed #3d7bd9;
		background: color-mix(in oklab, #3d7bd9 6%, transparent);
		cursor: move;
		touch-action: none;
	}

	.handle {
		position: absolute;
		display: grid;
		height: 22px;
		width: 22px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: white;
		color: #3d7bd9;
		box-shadow: 0 0 0 1.5px #3d7bd9, 0 2px 8px var(--shadow-faint);
	}

	.scale {
		right: -11px;
		bottom: -11px;
		cursor: nwse-resize;
	}

	.turn {
		top: -36px;
		left: calc(50% - 11px);
		cursor: grab;
	}

	.bar {
		position: absolute;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 4px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 5px 8px;
		box-shadow: 0 10px 30px var(--shadow-soft);
		transform: translateX(-50%);
	}

	.swatch {
		height: 24px;
		width: 24px;
		border-radius: var(--radius-pill);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 14%, transparent);
	}
</style>
