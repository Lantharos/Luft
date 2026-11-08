<script lang="ts">
	import Copy from '@lucide/svelte/icons/copy';
	import Highlighter from '@lucide/svelte/icons/highlighter';
	import NotebookPen from '@lucide/svelte/icons/notebook-pen';
	import { t } from '@luft/i18n';
	import type { Viewport } from '#lib/canvas/viewport.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import { tools } from '#lib/tools/tools.svelte.js';
	import { textSelection } from './selection.svelte';

	let { notebook, viewport, onquote }: { notebook: OpenNotebook; viewport: Viewport; onquote?: (text: string) => void } = $props();

	let place = $derived.by(() => {
		const index = textSelection.page ? notebook.indexOf(textSelection.page) : -1;
		const last = textSelection.selection.rects.at(-1);
		const page = viewport.layout.pages[index];
		if (!last || !page) return null;
		const [x, y] = viewport.toView(page.left + last.left + last.width, page.top + last.top + last.height);
		return { x: Math.min(Math.max(x, 140), viewport.width - 140), y: Math.min(y + 10, viewport.height - 56) };
	});

	const highlighterColor = () => tools.presets.find((preset) => preset.tool === 'highlighter')?.color ?? 0xffd23a;

	async function copy() {
		await navigator.clipboard.writeText(textSelection.selection.text);
		textSelection.clear();
	}
</script>

{#if place && textSelection.selection.text}
	<div class="bar" style:left="{place.x}px" style:top="{place.y}px" role="toolbar" aria-label={t('text-actions')} tabindex="-1" onpointerdown={(event) => event.stopPropagation()}>
		<button type="button" class="plain-button" onclick={() => textSelection.highlight(highlighterColor())}><Highlighter size={16} />{t('text-highlight')}</button>
		<button type="button" class="plain-button" onclick={() => void copy()}><Copy size={16} />{t('text-copy')}</button>
		{#if onquote}
			<button type="button" class="plain-button" onclick={() => (onquote(textSelection.selection.text), textSelection.clear())}><NotebookPen size={16} />{t('text-to-notes')}</button>
		{/if}
	</div>
{/if}

<style>
	.bar {
		position: absolute;
		z-index: 5;
		display: flex;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		padding: 4px;
		box-shadow: 0 10px 30px var(--shadow-soft);
		transform: translateX(-50%);
	}
</style>
