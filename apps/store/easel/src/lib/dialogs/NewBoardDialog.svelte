<script lang="ts">
	import { t } from '@luft/i18n';
	import { appearance, Dialog } from '@luft/ui';
	import { BoardDocument } from '#lib/board/board.svelte.js';
	import { DARK, LIGHT } from '#lib/board/render/look.js';
	import { boardBounds, boardSvg } from '#lib/board/svg.js';
	import { templateObjects, TEMPLATES, type Template } from '#lib/board/templates.js';
	import { templateLabel } from '#lib/app/labels.js';

	interface Props {
		oncreate: (template: Template) => void;
		onclose: () => void;
	}

	let { oncreate, onclose }: Props = $props();

	const PADDING = 48;

	let look = $derived(appearance.scheme === 'light' ? LIGHT : DARK);

	function preview(template: Template) {
		const board = new BoardDocument(templateObjects(template));
		const area = template === 'blank' ? { x: 0, y: 0, w: 640, h: 400 } : boardBounds(board.objects, board.lookup, PADDING);
		return boardSvg(board.objects, board.lookup, board.assets, look, area);
	}
</script>

<Dialog title={t('easel-new-board')} wide {onclose}>
	<div class="grid grid-cols-2 gap-3 p-1">
		{#each TEMPLATES as template (template)}
			<button type="button" class="template" onclick={() => oncreate(template)}>
				<span class="preview" style:background={look.paper} aria-hidden="true">{@html preview(template)}</span>
				<span class="text-[13px] font-medium">{templateLabel[template]()}</span>
			</button>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button" onclick={onclose}>{t('easel-cancel')}</button>
	{/snippet}
</Dialog>

<style>
	.template {
		display: flex;
		flex-direction: column;
		gap: 8px;
		border-radius: 14px;
		padding: 6px 6px 10px;
		text-align: left;
		transition: background 120ms;
	}

	.template:hover,
	.template:focus-visible {
		background: var(--surface-hover);
	}

	.preview {
		display: flex;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: 10px;
	}

	.preview :global(svg) {
		height: 100%;
		width: 100%;
	}
</style>
