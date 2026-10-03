<script lang="ts">
	import type { App } from '#lib/app.svelte.js';
	import { useApp } from '#lib/context.js';
	import type { Document } from '#lib/documents/document.svelte.js';
	import { encodingName } from '#lib/documents/encodings.js';
	import { describeIndentation } from '#lib/editor/indentation.js';
	import { encodingPicker, indentationPicker, languagePicker, lineEndingPicker } from '#lib/palette/pickers.js';
	import type { PaletteSource } from '#lib/palette/palette.svelte.js';
	import { quickOpen } from '#lib/palette/sources.js';
	import { tildify } from '#lib/utils/paths.js';

	const app = useApp();
	let workspace = $derived(app.workspace);
	let document = $derived(workspace.active);
	let cursor = $derived(workspace.cursor);

	let selection = $derived.by(() => {
		if (cursor.selections > 1) return `${cursor.selections} cursors`;
		return cursor.selected ? `${cursor.selected.toLocaleString()} selected` : '';
	});

	function pick(build: (app: App, document: Document) => PaletteSource) {
		if (document) app.palette.show(build(app, document));
	}
</script>

<footer class="status-bar" class:hidden={!document && !workspace.notice}>
	<span class="min-w-0 flex-1 truncate">
		{#if workspace.notice}
			<button type="button" class="status-notice" onclick={() => (workspace.notice = null)}>{workspace.notice}</button>
		{:else if document}
			{document.path ? tildify(document.path, workspace.home) : document.name}
		{/if}
	</span>
	{#if document}
		{#if selection}
			<span class="shrink-0">{selection}</span>
		{/if}
		<button type="button" class="status-item" onclick={() => app.palette.show(quickOpen(app), ':')}>Ln {cursor.line}, Col {cursor.column}</button>
		<button type="button" class="status-item" onclick={() => pick(indentationPicker)}>{describeIndentation(document.indentation)}</button>
		<button type="button" class="status-item" onclick={() => pick(encodingPicker)}>{encodingName(document.encoding, document.bom)}</button>
		<button type="button" class="status-item" onclick={() => pick(lineEndingPicker)}>{document.lineEnding.toUpperCase()}</button>
		<button type="button" class="status-item" onclick={() => pick(languagePicker)}>{document.language ?? 'Plain Text'}</button>
	{/if}
</footer>

<style>
	.status-bar {
		display: flex;
		height: 30px;
		flex: none;
		align-items: center;
		gap: 2px;
		padding-inline: 18px 10px;
		color: var(--text-muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		box-shadow: 0 -1px 0 var(--hairline);
	}

	.status-item {
		height: 22px;
		flex: none;
		border-radius: var(--radius-pill);
		padding-inline: 8px;
		transition: background-color 140ms var(--ease), color 140ms var(--ease);
	}

	.status-item:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.status-notice {
		max-width: 100%;
		overflow: hidden;
		color: var(--danger);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
