<script lang="ts">
	import { t } from '@luft/i18n';
	import { place } from '#lib/editor/edits.js';
	import { neighbours, type Limits } from '#lib/editor/limits.js';
	import { end, type Layout, type Part } from '#lib/editor/model.js';
	import SizeInput from './SizeInput.svelte';

	interface Props {
		layout: Layout;
		part: Part;
		limits: Limits;
		focused: boolean;
	}

	let { layout, part, limits, focused }: Props = $props();

	let around = $derived(neighbours(layout, part));
	let before = $derived(part.offset - around.before);
	let after = $derived(around.after - end(part));
	let largest = $derived(Math.min(limits.largest, limits.after - part.offset));
</script>

<div class="flex gap-2">
	<div class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="caption">{t('disks-editor-free-before')}</span>
		<SizeInput
			label={t('disks-editor-free-before-label')}
			exact
			value={before}
			min={limits.movable ? limits.before - around.before : limits.movesAtStart ? 0 : before}
			max={limits.movable ? limits.after - part.size - around.before : before}
			oncommit={(next) => place(part, around.before + next, part.size)}
		/>
	</div>
	<div class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="caption">{t('disks-editor-size')}</span>
		<SizeInput label={t('disks-editor-size')} exact {focused} value={part.size} min={limits.smallest} max={largest} oncommit={(next) => place(part, part.offset, next)} />
	</div>
	<div class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="caption">{t('disks-editor-free-after')}</span>
		<SizeInput
			label={t('disks-editor-free-after-label')}
			exact
			value={after}
			min={around.after - part.offset - largest}
			max={around.after - part.offset - limits.smallest}
			oncommit={(next) => place(part, part.offset, around.after - part.offset - next)}
		/>
	</div>
</div>

<style>
	.caption {
		padding-inline: 4px;
		font-size: 12px;
		color: var(--text-muted);
	}
</style>
