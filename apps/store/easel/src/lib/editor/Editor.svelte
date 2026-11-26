<script lang="ts">
	import { t } from '@luft/i18n';
	import { GlassShell } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import LayersPanel from '#lib/layers/LayersPanel.svelte';
	import type { ToolEvent } from '#lib/tools/tool.js';
	import { Presenter } from '#lib/gpu/presenter.js';
	import Stage from '#lib/viewport/Stage.svelte';
	import type { Editor } from './editor.svelte';
	import EditorHeader from './EditorHeader.svelte';
	import OverlayView from './OverlayView.svelte';
	import { editorShortcut } from './shortcuts';
	import TextEditing from './TextEditing.svelte';
	import ToolOptions from './ToolOptions.svelte';
	import ToolRail from './ToolRail.svelte';

	let { editor, name }: { editor: Editor; name: string } = $props();
	const app = useApp();

	let hover = $state<ToolEvent | null>(null);
	let doc = $derived(editor.doc);
	let settings = $derived(editor.settings);
	let painting = $derived(settings.tool === 'brush' || settings.tool === 'eraser');
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
			>
				<OverlayView viewport={editor.viewport} overlay={editor.overlay} shape={editor.shapePreview} {cursor} width={doc.width} height={doc.height} />
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
				<LayersPanel {doc} />
			</aside>
		</div>
	</main>
</GlassShell>

<style>
	:global(.stage) {
		background: color-mix(in oklab, var(--content) 72%, black);
	}
</style>
