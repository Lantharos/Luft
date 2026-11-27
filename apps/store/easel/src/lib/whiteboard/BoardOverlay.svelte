<script lang="ts">
	import { t } from '@luft/i18n';
	import { arrowPath, FRAME_BAND, LINE_HEIGHT } from '#lib/board/geometry.js';
	import { FRAME_TITLE_SIZE, LABEL_SIZE, NOTE_PADDING, NOTE_TEXT_SIZE } from '#lib/board/model.js';
	import { resolve, type Look } from '#lib/board/render/look.js';
	import type { Whiteboard } from './whiteboard.svelte';

	let { whiteboard, look }: { whiteboard: Whiteboard; look: Look } = $props();

	let board = $derived(whiteboard.board);
	let viewport = $derived(whiteboard.viewport);
	let selection = $derived(board.selection);
	let box = $derived(board.boundsOf(selection));
	let arrow = $derived(selection.length === 1 && selection[0].kind === 'arrow' ? selection[0] : null);
	let ends = $derived.by(() => {
		if (!arrow) return [];
		const path = arrowPath(arrow, board.lookup);
		return [path[0], path[path.length - 1]];
	});
	let editing = $derived(whiteboard.editing ? board.lookup(whiteboard.editing) : undefined);

	function screen(x: number, y: number, w = 0, h = 0) {
		const [sx, sy] = viewport.toScreen(x, y);
		return { x: sx, y: sy, width: w * viewport.scale, height: h * viewport.scale };
	}

	let field = $derived.by(() => {
		if (!editing || !('text' in editing)) return null;
		const s = viewport.scale;
		if (editing.kind === 'text') return { ...screen(editing.x, editing.y), size: editing.size * s, color: resolve(editing.color, look), width: null as number | null, align: 'left', weight: 500 };
		if (editing.kind === 'frame') return { ...screen(editing.x + 2, editing.y - FRAME_BAND), size: FRAME_TITLE_SIZE * s, color: look.frameTitle, width: null, align: 'left', weight: 600 };
		if (editing.kind === 'note') return { ...screen(editing.x + NOTE_PADDING, editing.y + NOTE_PADDING), size: NOTE_TEXT_SIZE * s, color: look.noteText, width: (editing.w - NOTE_PADDING * 2) * s, align: 'left', weight: 500 };
		return { ...screen(editing.x + 10, editing.y + editing.h / 2 - (LABEL_SIZE * LINE_HEIGHT) / 2), size: LABEL_SIZE * s, color: resolve(editing.color, look), width: (editing.w - 20) * s, align: 'center', weight: 600 };
	});
</script>

<svg class="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
	{#if box && !whiteboard.editing}
		{@const rect = screen(box.x, box.y, box.w, box.h)}
		<rect class="frame" x={rect.x - 4} y={rect.y - 4} width={rect.width + 8} height={rect.height + 8} rx="6" />
		{#if arrow}
			{#each ends as [x, y], index (index)}
				{@const point = screen(x, y)}
				<circle class="handle" cx={point.x} cy={point.y} r="6" />
			{/each}
		{:else}
			<circle class="handle" cx={rect.x + rect.width} cy={rect.y + rect.height} r="6" />
		{/if}
	{/if}
	{#if whiteboard.marquee}
		{@const rect = screen(whiteboard.marquee.x, whiteboard.marquee.y, whiteboard.marquee.w, whiteboard.marquee.h)}
		<rect class="marquee" {...rect} />
	{/if}
</svg>

{#if editing && field}
	<textarea
		class="editing"
		aria-label={t('easel-text-content')}
		style:left="{field.x}px"
		style:top="{field.y}px"
		style:width={field.width === null ? undefined : `${field.width}px`}
		style:font="{field.weight} {field.size}px 'Open Runde'"
		style:line-height={LINE_HEIGHT}
		style:color={field.color}
		style:text-align={field.align}
		style:white-space={field.width === null ? 'pre' : 'pre-wrap'}
		value={'text' in editing ? editing.text : ''}
		spellcheck="false"
		{@attach (node) => {
			node.focus();
			node.select();
		}}
		onpointerdown={(event) => event.stopPropagation()}
		oninput={(event) => (whiteboard.draft = event.currentTarget.value)}
		onkeydown={(event) => {
			event.stopPropagation();
			if (event.key === 'Escape' || (event.key === 'Enter' && (event.ctrlKey || event.metaKey))) whiteboard.finishEditing();
		}}
		onblur={() => whiteboard.finishEditing()}
	></textarea>
{/if}

<style>
	svg * {
		fill: none;
	}

	.frame {
		stroke: var(--accent);
		stroke-width: 1.5;
	}

	.handle {
		fill: var(--popover);
		stroke: var(--accent);
		stroke-width: 2;
	}

	.marquee {
		fill: color-mix(in oklab, var(--accent) 10%, transparent);
		stroke: var(--accent-line);
		stroke-width: 1;
	}

	.editing {
		position: absolute;
		min-width: 24px;
		field-sizing: content;
		resize: none;
		overflow: hidden;
		background: transparent;
		outline: none;
		caret-color: currentColor;
	}
</style>
