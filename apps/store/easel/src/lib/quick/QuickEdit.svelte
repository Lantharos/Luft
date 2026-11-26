<script lang="ts">
	import { modeLabel } from '#lib/app/labels.js';
	import Crop from '@luft/symbols/icons/crop';
	import EyeOff from '@luft/symbols/icons/eye-off';
	import Maximize from '@luft/symbols/icons/maximize-2';
	import PenLine from '@luft/symbols/icons/pen-line';
	import Sun from '@luft/symbols/icons/sun';
	import Undo from '@luft/symbols/icons/undo-2';
	import { t } from '@luft/i18n';
	import { tooltip, WindowControls } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import OverlayView from '#lib/editor/stage/OverlayView.svelte';
	import TextEditing from '#lib/editor/stage/TextEditing.svelte';
	import { Presenter } from '#lib/gpu/presenter.js';
	import type { ToolEvent } from '#lib/tools/tool.js';
	import Stage from '#lib/viewport/Stage.svelte';
	import AdjustBar from './AdjustBar.svelte';
	import CropBar from './CropBar.svelte';
	import HideBar from './HideBar.svelte';
	import MarkupBar from './MarkupBar.svelte';
	import type { QuickEdit, QuickMode } from './quick.svelte';
	import SizeBar from './SizeBar.svelte';

	let { quick, name }: { quick: QuickEdit; name: string } = $props();
	const app = useApp();

	const MODES: { id: QuickMode; icon: typeof Crop }[] = [
		{ id: 'crop', icon: Crop },
		{ id: 'adjust', icon: Sun },
		{ id: 'markup', icon: PenLine },
		{ id: 'hide', icon: EyeOff },
		{ id: 'size', icon: Maximize }
	];

	let doc = $derived(quick.doc);
	let hover = $state<ToolEvent | null>(null);
	let cursor = $derived(quick.mode === 'markup' && quick.markupTool === 'pen' && hover ? { x: hover.x, y: hover.y, radius: quick.settings.brush.size / 2 } : null);

	function keydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || app.dialog) return;
		if (quick.handler?.key?.(event)) return event.preventDefault();
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			if (event.shiftKey) doc.redo();
			else doc.undo();
		}
	}
</script>

<svelte:window onkeydown={keydown} />

<main class="quick flex h-full flex-col">
	<header class="drag-region flex h-14 flex-none items-center gap-1.5 pr-3 pl-5">
		<h1 class="truncate text-[15px] font-semibold">{name}</h1>
		<div class="flex-1"></div>
		<button type="button" class="icon-button" aria-label={t('easel-undo')} disabled={!doc.history.canUndo} onclick={() => doc.undo()} {@attach tooltip(t('easel-undo'))}><Undo size={18} /></button>
		<button type="button" class="plain-button" onclick={() => app.openQuickInEditor()}>{t('easel-open-in-editor')}</button>
		<button type="button" class="button primary" onclick={() => app.finishQuick()}>{t('easel-done')}</button>
		<div class="ml-2.5"><WindowControls onclose={() => app.close()} /></div>
	</header>
	<Stage
		viewport={quick.viewport}
		surface={(canvas) => new Presenter(canvas, () => ({ ...doc.scene(quick.view()), checker: [[0.2, 0.2, 0.19, 1], [0.15, 0.15, 0.14, 1]] }))}
		handler={quick.handler}
		cursor={quick.handler?.cursor ?? 'default'}
		connect={(invalidate) => (doc.onchange = invalidate)}
		onhover={(event) => (hover = event)}
	>
		<OverlayView viewport={quick.viewport} overlay={quick.overlay} shape={quick.shapePreview} {cursor} width={doc.width} height={doc.height} />
		{#if quick.text.editing}
			<TextEditing tool={quick.text} viewport={quick.viewport} />
		{/if}
	</Stage>
	<footer class="flex flex-none flex-col items-center gap-3.5 px-4 pt-1.5 pb-5">
		<div class="flex min-h-10 flex-wrap items-center justify-center gap-4">
			{#if quick.mode === 'crop'}
				<CropBar {quick} />
			{:else if quick.mode === 'adjust'}
				<AdjustBar {quick} />
			{:else if quick.mode === 'markup'}
				<MarkupBar {quick} />
			{:else if quick.mode === 'hide'}
				<HideBar {quick} />
			{:else}
				<SizeBar {quick} />
			{/if}
		</div>
		<nav class="modes" aria-label={t('easel-quick-modes')}>
			{#each MODES as mode (mode.id)}
				<button type="button" class={['mode', quick.mode === mode.id && 'is-active']} aria-pressed={quick.mode === mode.id} onclick={() => quick.choose(mode.id)}>
					<mode.icon size={18} />{modeLabel[mode.id]()}
				</button>
			{/each}
		</nav>
	</footer>
</main>

<style>
	.quick {
		--stage: color-mix(in oklab, var(--app-bg) 70%, black);
		background: var(--stage);
		border-radius: var(--window-radius);
		color: var(--text);
	}

	.quick :global(.stage) {
		background: var(--stage);
	}

	.modes {
		display: flex;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		padding: 4px;
	}

	.mode {
		display: flex;
		height: 38px;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		padding-inline: 14px;
		color: var(--text-soft);
		font-size: 13.5px;
		font-weight: 500;
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate);
	}

	.mode:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.mode.is-active {
		background: var(--control-hover);
		color: var(--text);
	}
</style>
