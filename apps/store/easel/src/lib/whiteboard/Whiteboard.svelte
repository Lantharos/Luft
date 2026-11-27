<script lang="ts">
	import Minus from '@luft/symbols/icons/minus';
	import Plus from '@luft/symbols/icons/plus';
	import Redo from '@luft/symbols/icons/redo-2';
	import Undo from '@luft/symbols/icons/undo-2';
	import { t } from '@luft/i18n';
	import { appearance, fileDrop, GlassShell, tooltip, WindowControls } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import { BoardRenderer } from '#lib/board/render/renderer.js';
	import { DARK, LIGHT } from '#lib/board/render/look.js';
	import { addPicture } from '#lib/files/board-file.js';
	import { fetchBytes } from '#lib/files/pixels.js';
	import { extension } from '#lib/files/picture.js';
	import Stage from '#lib/viewport/Stage.svelte';
	import BoardOverlay from './BoardOverlay.svelte';
	import BoardToolbar from './BoardToolbar.svelte';
	import { hint } from './hints';
	import { boardShortcut } from './shortcuts';
	import { BoardSurface } from './surface';
	import type { Whiteboard } from './whiteboard.svelte';

	let { whiteboard, name }: { whiteboard: Whiteboard; name: string } = $props();
	const app = useApp();
	const renderer = new BoardRenderer();
	const TYPES: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', bmp: 'image/bmp' };

	let board = $derived(whiteboard.board);
	let look = $derived(appearance.scheme === 'light' ? LIGHT : DARK);
	let percent = $derived(Math.round(whiteboard.viewport.scale * 100));

	$effect(() => () => renderer.destroy());
	$effect(() => {
		void look;
		whiteboard.redraw();
	});

	async function addFiles(paths: string[]) {
		const { viewport } = whiteboard;
		for (const path of paths) {
			const type = TYPES[extension(path)];
			if (type) await addPicture(board, await fetchBytes(path), type, viewport.toDocument(viewport.width / 2, viewport.height / 2), t('easel-history-picture'));
		}
	}

	const drop = fileDrop((paths) => void addFiles(paths));
</script>

<svelte:window onkeydown={(event) => boardShortcut(app, whiteboard, event)} ondragovercapture={drop.ondragover} ondropcapture={drop.ondrop} />

<GlassShell class="h-full">
	<main class="glass-content relative" style:--paper={look.paper}>
		<header class="drag-region relative z-10 flex h-14 flex-none items-center gap-1.5 pr-3 pl-5">
			<h1 class="truncate text-[15px] font-semibold">{name}{board.history.modified ? ' •' : ''}</h1>
			<div class="flex-1"></div>
			<button type="button" class="icon-button" aria-label={t('easel-undo')} disabled={!board.history.canUndo} onclick={() => board.undo()} {@attach tooltip(hint(t('easel-undo'), 'Z', 'ctrl'))}><Undo size={18} /></button>
			<button type="button" class="icon-button" aria-label={t('easel-redo')} disabled={!board.history.canRedo} onclick={() => board.redo()} {@attach tooltip(hint(t('easel-redo'), 'Z', 'ctrl', 'shift'))}><Redo size={18} /></button>
			<button type="button" class="chip" onclick={() => app.fitBoard()} {@attach tooltip(hint(t('easel-zoom-fit'), '0', 'ctrl'))}>{t('easel-zoom-fit')}</button>
			<button type="button" class="button ml-1.5" onclick={() => (app.dialog = 'export')} {@attach tooltip(hint(t('easel-export'), 'E', 'ctrl'))}>{t('easel-export')}</button>
			<div class="ml-2.5"><WindowControls onclose={() => app.close()} /></div>
		</header>
		<div class="absolute inset-0 flex">
			<Stage
				viewport={whiteboard.viewport}
				surface={(canvas) => new BoardSurface(canvas, whiteboard, renderer, () => look)}
				handler={whiteboard.handler}
				cursor={whiteboard.tool === 'select' ? 'default' : 'crosshair'}
				fingerPans
				connect={(invalidate) => {
					whiteboard.redraw = invalidate;
					board.onchange = invalidate;
				}}
			>
				<BoardOverlay {whiteboard} {look} />
			</Stage>
		</div>
		<div class="zoom">
			<button type="button" class="icon-button" aria-label={t('easel-zoom-out')} onclick={() => whiteboard.viewport.zoomBy(0.8)} {@attach tooltip(hint(t('easel-zoom-out'), '-', 'ctrl'))}><Minus size={16} /></button>
			<span class="w-11 text-center text-[12.5px] text-(--text-soft) tabular-nums">{percent}%</span>
			<button type="button" class="icon-button" aria-label={t('easel-zoom-in')} onclick={() => whiteboard.viewport.zoomBy(1.25)} {@attach tooltip(hint(t('easel-zoom-in'), '+', 'ctrl'))}><Plus size={16} /></button>
		</div>
		<div class="toolbar">
			<BoardToolbar {whiteboard} {look} onpicture={() => void app.choosePictures().then(addFiles)} />
		</div>
	</main>
</GlassShell>

<style>
	main :global(.stage) {
		background: var(--paper);
	}

	.zoom {
		position: absolute;
		bottom: 24px;
		left: 16px;
		display: flex;
		align-items: center;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 92%, transparent);
		padding: 4px;
		box-shadow: 0 8px 24px var(--shadow-soft);
	}

	.toolbar {
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
	}
</style>
