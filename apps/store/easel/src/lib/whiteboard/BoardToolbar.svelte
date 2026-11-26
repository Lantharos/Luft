<script lang="ts">
	import { boardToolLabel } from '#lib/app/labels.js';
	import ArrowUpRight from '@luft/symbols/icons/arrow-up-right';
	import Circle from '@luft/symbols/icons/circle';
	import Eraser from '@luft/symbols/icons/eraser';
	import Highlighter from '@luft/symbols/icons/highlighter';
	import ImageIcon from '@luft/symbols/icons/image';
	import MousePointer from '@luft/symbols/icons/mouse-pointer-2';
	import Pen from '@luft/symbols/icons/pen';
	import Shapes from '@luft/symbols/icons/shapes';
	import Square from '@luft/symbols/icons/square';
	import StickyNote from '@luft/symbols/icons/sticky-note';
	import Type from '@luft/symbols/icons/type';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, tooltip } from '@luft/ui';
	import { NOTE_COLORS, PEN_COLORS } from '#lib/board/model.js';
	import { INK, resolve, type Look } from '#lib/board/render/look.js';
	import type { BoardTool } from '#lib/board/tools/tool.js';
	import type { Whiteboard } from './whiteboard.svelte';

	interface Props {
		whiteboard: Whiteboard;
		look: Look;
		onpicture: () => void;
	}

	let { whiteboard, look, onpicture }: Props = $props();

	const DRAWING: { id: BoardTool; icon: typeof Pen }[] = [
		{ id: 'select', icon: MousePointer },
		{ id: 'pen', icon: Pen },
		{ id: 'highlighter', icon: Highlighter },
		{ id: 'eraser', icon: Eraser }
	];
	const PLACING: { id: BoardTool; icon: typeof Pen }[] = [
		{ id: 'arrow', icon: ArrowUpRight },
		{ id: 'text', icon: Type },
		{ id: 'note', icon: StickyNote }
	];

	let notes = $derived(whiteboard.tool === 'note');
	let colors = $derived(notes ? NOTE_COLORS : [INK, ...PEN_COLORS.slice(1)]);
	let current = $derived(notes ? whiteboard.note : whiteboard.color);
</script>

{#snippet button(id: BoardTool, Icon: typeof Pen)}
	<button type="button" class={['board-tool', whiteboard.tool === id && 'is-active']} aria-label={boardToolLabel[id]()} aria-pressed={whiteboard.tool === id} onclick={() => whiteboard.choose(id)} {@attach tooltip(boardToolLabel[id]())}>
		<Icon size={20} />
	</button>
{/snippet}

<nav class="floating-bar" aria-label={t('easel-board-tools')}>
	{#each DRAWING as entry (entry.id)}{@render button(entry.id, entry.icon)}{/each}
	<span class="divider"></span>
	<MenuButton label={t('easel-board-shape')} class={['board-tool', whiteboard.tool === 'shape' && 'is-active']}>
		{#snippet trigger()}<Shapes size={20} />{/snippet}
		{#snippet children(close)}
			<MenuItem checked={whiteboard.shapeKind === 'rectangle'} onclick={() => (close(), (whiteboard.shapeKind = 'rectangle'), whiteboard.choose('shape'))}><Square size={16} />{t('easel-shape-box')}</MenuItem>
			<MenuItem checked={whiteboard.shapeKind === 'ellipse'} onclick={() => (close(), (whiteboard.shapeKind = 'ellipse'), whiteboard.choose('shape'))}><Circle size={16} />{t('easel-shape-ellipse')}</MenuItem>
			<MenuItem checked={whiteboard.shapeKind === 'diamond'} onclick={() => (close(), (whiteboard.shapeKind = 'diamond'), whiteboard.choose('shape'))}><Square size={16} class="rotate-45 scale-90" />{t('easel-shape-diamond')}</MenuItem>
		{/snippet}
	</MenuButton>
	{#each PLACING as entry (entry.id)}{@render button(entry.id, entry.icon)}{/each}
	<button type="button" class="board-tool" aria-label={t('easel-board-picture')} onclick={onpicture} {@attach tooltip(t('easel-board-picture'))}><ImageIcon size={20} /></button>
	<span class="divider"></span>
	<div class="flex gap-2 px-2" role="radiogroup" aria-label={t(notes ? 'easel-board-note-color' : 'easel-board-color')}>
		{#each colors as color (color)}
			<button
				type="button"
				role="radio"
				aria-checked={current === color}
				aria-label={color === INK ? t('easel-board-ink') : color}
				class={['dot', current === color && 'is-chosen']}
				style:--dot={resolve(color, look)}
				onclick={() => (notes ? (whiteboard.note = color) : (whiteboard.color = color))}
			></button>
		{/each}
	</div>
</nav>

<style>
	.floating-bar {
		display: flex;
		align-items: center;
		gap: 2px;
		border-radius: var(--radius-pill);
		background: color-mix(in oklab, var(--popover) 92%, transparent);
		padding: 5px;
		box-shadow: 0 8px 24px var(--shadow-soft);
		backdrop-filter: blur(18px);
	}

	.divider {
		height: 24px;
		width: 1px;
		margin-inline: 4px;
		background: var(--hairline);
	}

	.dot {
		height: 20px;
		width: 20px;
		border-radius: var(--radius-pill);
		background: var(--dot);
		box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--ink) 15%, transparent);
	}

	.dot.is-chosen {
		box-shadow: 0 0 0 2px var(--popover), 0 0 0 4px var(--dot);
	}
</style>
