<script lang="ts">
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Circle from '@lucide/svelte/icons/circle';
	import Crop from '@lucide/svelte/icons/crop';
	import Droplets from '@lucide/svelte/icons/droplets';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import FlipHorizontal from '@lucide/svelte/icons/flip-horizontal-2';
	import FlipVertical from '@lucide/svelte/icons/flip-vertical-2';
	import Highlighter from '@lucide/svelte/icons/highlighter';
	import Minus from '@lucide/svelte/icons/minus';
	import MousePointer from '@lucide/svelte/icons/mouse-pointer-2';
	import Redo2 from '@lucide/svelte/icons/redo-2';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import Square from '@lucide/svelte/icons/square';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Type from '@lucide/svelte/icons/type';
	import Undo2 from '@lucide/svelte/icons/undo-2';
	import { t } from '@luft/i18n';
	import { IconButton, tooltip } from '@luft/ui';
	import type { Component } from 'svelte';
	import { editor, type Tool } from '#lib/state/editor.svelte.js';

	const COLORS = ['#e5484d', '#f5a524', '#30a46c', '#3e8eff', '#ffffff', '#111111'];

	const tools: { id: Tool; icon: Component; label: string; key: string }[] = $derived([
		{ id: 'move', icon: MousePointer, label: t('tool-move'), key: 'V' },
		{ id: 'crop', icon: Crop, label: t('tool-crop'), key: 'C' },
		{ id: 'arrow', icon: ArrowUpRight, label: t('tool-arrow'), key: 'A' },
		{ id: 'line', icon: Minus, label: t('tool-line'), key: 'L' },
		{ id: 'box', icon: Square, label: t('tool-box'), key: 'B' },
		{ id: 'ellipse', icon: Circle, label: t('tool-ellipse'), key: 'E' },
		{ id: 'highlight', icon: Highlighter, label: t('tool-highlight'), key: 'H' },
		{ id: 'text', icon: Type, label: t('tool-text'), key: 'T' },
		{ id: 'blur', icon: Droplets, label: t('tool-blur'), key: 'U' },
		{ id: 'redact', icon: EyeOff, label: t('tool-redact'), key: 'R' }
	]);
	const coloured = $derived(['arrow', 'line', 'box', 'ellipse', 'text'].includes(editor.tool));
</script>

<div class="flex flex-wrap items-center gap-0.5 px-3 pb-2" role="toolbar" aria-label={t('edit-tools')}>
	{#each tools as tool (tool.id)}
		<button
			type="button"
			class="icon-button"
			class:chosen={editor.tool === tool.id}
			aria-label={tool.label}
			aria-pressed={editor.tool === tool.id}
			{@attach tooltip(`${tool.label}  ${tool.key}`)}
			onclick={() => (editor.tool = tool.id)}
		>
			<tool.icon size={18} />
		</button>
	{/each}
	{#if coloured}
		<span class="mx-1 flex items-center gap-1">
			{#each COLORS as color (color)}
				<button
					type="button"
					class="swatch"
					class:chosen={editor.color === color}
					style:background={color}
					aria-label={t('edit-color', { color })}
					aria-pressed={editor.color === color}
					onclick={() => (editor.color = color)}
				></button>
			{/each}
		</span>
	{/if}
	<span class="flex-1"></span>
	{#if editor.selectedMark !== null}
		<IconButton icon={Trash2} label={t('edit-delete-mark')} onclick={() => editor.removeSelected()} />
	{/if}
	<IconButton icon={RotateCw} label={t('edit-rotate')} onclick={() => editor.rotate()} />
	<IconButton icon={FlipHorizontal} label={t('edit-flip-horizontal')} onclick={() => editor.flipHorizontal()} />
	<IconButton icon={FlipVertical} label={t('edit-flip-vertical')} onclick={() => editor.flipVertical()} />
	<IconButton icon={Undo2} label={t('edit-undo')} disabled={!editor.canUndo} onclick={() => editor.undo()} />
	<IconButton icon={Redo2} label={t('edit-redo')} disabled={!editor.canRedo} onclick={() => editor.redo()} />
</div>

<style>
	.chosen.icon-button {
		background: var(--accent-soft);
		color: var(--text);
	}

	.swatch {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px var(--hairline);
	}

	.swatch.chosen {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
</style>
