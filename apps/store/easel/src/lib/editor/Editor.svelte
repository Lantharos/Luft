<script lang="ts">
	import { t } from '@luft/i18n';
	import { GlassShell } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import AdjustmentDialog from '#lib/adjust/AdjustmentDialog.svelte';
	import FilterDialog from '#lib/filters/FilterDialog.svelte';
	import EffectsDialog from '#lib/layers/EffectsDialog.svelte';
	import LayersPanel from '#lib/layers/LayersPanel.svelte';
	import type { ToolEvent } from '#lib/tools/tool.js';
	import { Presenter } from '#lib/gpu/presenter.js';
	import Stage from '#lib/viewport/Stage.svelte';
	import type { Editor } from './editor.svelte';
	import EditorHeader from './EditorHeader.svelte';
	import OverlayView from './stage/OverlayView.svelte';
	import { editorShortcut } from './shortcuts';
	import TextEditing from './stage/TextEditing.svelte';
	import ToolOptions from './ToolOptions.svelte';
	import ToolRail from './ToolRail.svelte';
	import Rulers from './stage/Rulers.svelte';
	import { snapEvent } from './stage/snap';

	let { editor, name }: { editor: Editor; name: string } = $props();
	const SNAPPED = new Set(['select', 'crop', 'shapes', 'gradient', 'text', 'lasso']);
	const app = useApp();

	let hover = $state<ToolEvent | null>(null);
	let doc = $derived(editor.doc);
	let settings = $derived(editor.settings);
	let painting = $derived(['brush', 'eraser', 'clone', 'heal', 'smudge'].includes(settings.tool));
	let brush = $derived(settings.tool === 'eraser' ? settings.eraser : settings.brush);
	let cursor = $derived(painting && hover ? { x: hover.x, y: hover.y, radius: brush.size / 2 } : null);
</script>

<svelte:window onkeydown={(event) => editorShortcut(app, editor, event)} />

<GlassShell class="h-full [--sidebar-width:64px]" followSidebar>
	<ToolRail {editor} />
	<main class="glass-content">
		<EditorHeader {editor} {name} />
		<div class="flex min-h-0 flex-1">
			<Stage
				viewport={editor.viewport}
				surface={(canvas) => new Presenter(canvas, () => doc.scene(editor.viewport.matrix()))}
				handler={editor.handler}
				cursor={editor.handler.cursor}
				connect={(invalidate) => (doc.onchange = invalidate)}
				onhover={(event) => (hover = event)}
				adjust={(event) => (settings.snapping && SNAPPED.has(settings.tool) ? snapEvent(doc, editor.viewport.scale, event) : event)}
			>
				<OverlayView viewport={editor.viewport} overlay={editor.overlay} shape={editor.shapePreview} {cursor} width={doc.width} height={doc.height} />
				{#if settings.rulers}
					<Rulers {doc} viewport={editor.viewport} />
				{/if}
				{#if editor.text.editing}
					<TextEditing tool={editor.text} viewport={editor.viewport} />
				{/if}
				{#if doc.selectionBounds && doc.selectionActive}
					<span class="absolute bottom-3.5 left-4 text-[12px] text-(--text-muted) tabular-nums">{t('easel-selection-size', { width: Math.round(doc.selectionBounds.width), height: Math.round(doc.selectionBounds.height) })}</span>
				{/if}
			</Stage>
			<aside class="flex w-[280px] flex-none flex-col gap-4.5 border-l border-(--hairline) px-3.5 py-4">
				<ToolOptions {editor} />
				<div class="h-px flex-none bg-(--hairline)"></div>
				<LayersPanel {doc} onadjust={(layer) => (editor.panel = { kind: 'adjustment', layer })} oneffects={(layer) => (editor.panel = { kind: 'effects', layer })} />
			</aside>
		</div>
	</main>
</GlassShell>

{#if editor.panel?.kind === 'filter'}
	<FilterDialog {doc} kind={editor.panel.filter} onclose={() => (editor.panel = null)} />
{:else if editor.panel}
	{@const target = doc.layers.find((layer) => editor.panel && 'layer' in editor.panel && layer.id === editor.panel.layer)}
	{#if target && editor.panel.kind === 'adjustment'}
		<AdjustmentDialog {doc} layer={target} onclose={() => (editor.panel = null)} />
	{:else if target}
		<EffectsDialog {doc} layer={target} onclose={() => (editor.panel = null)} />
	{/if}
{/if}

<style>
	:global(.stage) {
		background: color-mix(in oklab, var(--content) 72%, black);
	}
</style>
