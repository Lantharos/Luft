<script lang="ts">
	import { bytes } from '@luft/ui';
	import type { Drive } from '#lib/api.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { limitsOf } from '#lib/editor/limits.js';
	import { gaps, type Layout } from '#lib/editor/model.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import EditorBar from './EditorBar.svelte';
	import FreeInspector from './FreeInspector.svelte';
	import LayoutList from './LayoutList.svelte';
	import PartInspector from './PartInspector.svelte';
	import PlanList from './PlanList.svelte';

	interface Props {
		drive: Drive;
		layout: Layout;
	}

	let { drive, layout }: Props = $props();

	const TONES = ['var(--accent)', 'var(--tertiary)', 'var(--secondary)'];

	let free = $derived(gaps(layout));
	let tones = $derived(new Map(layout.parts.map((part, index) => [part.key, TONES[index % TONES.length]])));
	let part = $derived(layout.parts.find((candidate) => candidate.key === editor.selected) ?? null);
	let gap = $derived(free.find((candidate) => `free:${candidate.offset}` === editor.selected) ?? null);
	let limits = $derived(part ? limitsOf(layout, part, (filesystem) => disks.support(filesystem)) : null);
	let summary = $derived(
		[
			layout.table === 'gpt' ? 'GPT partition table' : 'MBR partition table',
			`${bytes(free.reduce((total, candidate) => total + candidate.size, 0))} free`,
			'Partitions start on 1 MiB boundaries'
		].join(' · ')
	);

	function keydown(event: KeyboardEvent) {
		if (event.target instanceof HTMLInputElement || dialogs.current) return;
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
			event.preventDefault();
			editor.undo();
		} else if (event.key === 'Escape') {
			editor.selected = null;
		}
	}
</script>

<svelte:window onkeydown={keydown} />

<section class="flex flex-col gap-5">
	<p class="min-h-9 px-1.5 pt-2 text-[14px] text-[var(--text-muted)]">{summary}</p>
	<EditorBar {layout} total={drive.size} {limits} {tones} />
	{#if part && limits}
		{#key part.key}
			<PartInspector {layout} {part} {limits} />
		{/key}
	{:else if gap}
		<FreeInspector {layout} {gap} removable={drive.removable} />
	{:else}
		<LayoutList {layout} {tones} />
	{/if}
</section>

<PlanList />
