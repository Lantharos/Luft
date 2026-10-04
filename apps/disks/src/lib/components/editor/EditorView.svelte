<script lang="ts">
	import type { Drive } from '#lib/api.js';
	import { editor } from '#lib/editor/editor.svelte.js';
	import { limitsOf } from '#lib/editor/limits.js';
	import { gaps, type Layout } from '#lib/editor/model.js';
	import { dialogs } from '#lib/dialogs/dialogs.svelte.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import EditorBar from './EditorBar.svelte';
	import type { Placed } from './fit';
	import FreeInspector from './inspector/FreeInspector.svelte';
	import PartInspector from './inspector/PartInspector.svelte';
	import LayoutList from './LayoutList.svelte';
	import PlanList from './PlanList.svelte';

	interface Props {
		drive: Drive;
		layout: Layout;
	}

	let { drive, layout }: Props = $props();

	const TONES = ['var(--accent)', 'var(--tertiary)', 'var(--secondary)'];

	let width = $state(0);
	let inspectorWidth = $state(0);
	let anchor = $state.raw<Placed | null>(null);

	let tones = $derived(new Map(layout.parts.map((part, index) => [part.key, TONES[index % TONES.length]])));
	let part = $derived(layout.parts.find((candidate) => candidate.key === editor.selected) ?? null);
	let gap = $derived(gaps(layout).find((candidate) => `free:${candidate.offset}` === editor.selected) ?? null);
	let limits = $derived(part ? limitsOf(layout, part, (filesystem) => disks.support(filesystem)) : null);
	let reporting = $derived(editor.running || editor.outcome !== null);
	let offset = $derived(anchor ? Math.max(0, Math.min(width - inspectorWidth, anchor.left + anchor.width / 2 - inspectorWidth / 2)) : 0);

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

<section bind:clientWidth={width} class="flex flex-col gap-4 pt-3">
	<EditorBar {layout} limits={reporting ? null : limits} {tones} onplaced={(box) => (anchor = box)} />
	{#if reporting}
		<PlanList />
	{:else if (part && limits) || gap}
		<div bind:offsetWidth={inspectorWidth} class="max-w-full self-start" style:margin-left="{offset}px">
			{#if part && limits}
				{#key part.key}
					<PartInspector {layout} {part} {limits} />
				{/key}
			{:else if gap}
				<FreeInspector {layout} {gap} removable={drive.removable} />
			{/if}
		</div>
	{:else}
		<LayoutList {layout} {tones} />
	{/if}
</section>
