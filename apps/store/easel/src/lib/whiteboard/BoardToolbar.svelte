<script lang="ts">
	import { boardToolLabel } from '#lib/app/labels.js';
	import ArrowUpRight from '@luft/symbols/icons/arrow-up-right';
	import Circle from '@luft/symbols/icons/circle';
	import Elbow from '@luft/symbols/icons/elbow';
	import Eraser from '@luft/symbols/icons/eraser';
	import FrameIcon from '@luft/symbols/icons/frame';
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
	import { NOTE_COLORS, PEN_COLORS, type ShapeKind } from '#lib/board/model.js';
	import { INK, resolve, type Look } from '#lib/board/render/look.js';
	import type { BoardTool } from '#lib/board/tools/tool.js';
	import { colorName, hint, SHAPE_KEYS, TOOL_KEYS } from './hints';
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
	const SHAPES: { kind: ShapeKind; icon: typeof Pen; label: () => string }[] = [
		{ kind: 'rectangle', icon: Square, label: () => t('easel-shape-box') },
		{ kind: 'ellipse', icon: Circle, label: () => t('easel-shape-ellipse') },
		{ kind: 'diamond', icon: Square, label: () => t('easel-shape-diamond') }
	];
	const PLACING: { id: BoardTool; icon: typeof Pen }[] = [
		{ id: 'text', icon: Type },
		{ id: 'note', icon: StickyNote },
		{ id: 'frame', icon: FrameIcon }
	];

	let notes = $derived(whiteboard.tool === 'note');
	let colors = $derived(notes ? NOTE_COLORS : [INK, ...PEN_COLORS.slice(1)]);
	let current = $derived(notes ? whiteboard.note : whiteboard.color);

	const named = (tool: BoardTool) => hint(boardToolLabel[tool](), TOOL_KEYS[tool]!);
</script>

{#snippet button(id: BoardTool, Icon: typeof Pen)}
	<button type="button" class={['board-tool', whiteboard.tool === id && 'is-active']} aria-label={boardToolLabel[id]()} aria-pressed={whiteboard.tool === id} onclick={() => whiteboard.choose(id)} {@attach tooltip(named(id))}>
		<Icon size={20} />
	</button>
{/snippet}

<nav class="floating-bar" aria-label={t('easel-board-tools')}>
	{#each DRAWING as entry (entry.id)}{@render button(entry.id, entry.icon)}{/each}
	<span class="divider"></span>
	<MenuButton label={t('easel-board-shape')} class={['board-tool', whiteboard.tool === 'shape' && 'is-active']} {@attach tooltip(named('shape'))}>
		{#snippet trigger()}<Shapes size={20} />{/snippet}
		{#snippet children(close)}
			{#each SHAPES as entry (entry.kind)}
				<MenuItem checked={whiteboard.shapeKind === entry.kind} onclick={() => (close(), whiteboard.chooseShape(entry.kind))}>
					<entry.icon size={16} class={entry.kind === 'diamond' ? 'rotate-45 scale-90' : undefined} />
					<span class="flex-1">{entry.label()}</span>
					<span class="text-[11.5px] text-(--text-muted)">{SHAPE_KEYS[entry.kind]}</span>
				</MenuItem>
			{/each}
		{/snippet}
	</MenuButton>
	<MenuButton label={t('easel-board-arrow')} class={['board-tool', whiteboard.tool === 'arrow' && 'is-active']} {@attach tooltip(named('arrow'))}>
		{#snippet trigger()}{#if whiteboard.routing === 'elbow'}<Elbow size={20} />{:else}<ArrowUpRight size={20} />{/if}{/snippet}
		{#snippet children(close)}
			<MenuItem checked={whiteboard.routing === 'straight'} onclick={() => (close(), whiteboard.chooseRoute('straight'))}><ArrowUpRight size={16} />{t('easel-arrow-straight')}</MenuItem>
			<MenuItem checked={whiteboard.routing === 'elbow'} onclick={() => (close(), whiteboard.chooseRoute('elbow'))}><Elbow size={16} />{t('easel-arrow-elbow')}</MenuItem>
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
				aria-label={colorName(color)}
				class={['dot', current === color && 'is-chosen']}
				style:--dot={resolve(color, look)}
				onclick={() => (notes ? (whiteboard.note = color) : (whiteboard.color = color))}
				{@attach tooltip(colorName(color))}
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
