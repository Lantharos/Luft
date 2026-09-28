<script lang="ts">
	import { tick } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import type { Layout } from './api';

	interface Props {
		layouts: Layout[];
		added: string[];
		onadd: (layout: Layout) => void;
		onclose: () => void;
	}

	let { layouts, added, onadd, onclose }: Props = $props();

	let query = $state('');
	let selected = $state<Layout | null>(null);
	let list = $state<HTMLDivElement>();

	let results = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return layouts.filter((layout) => !added.includes(layout.id) && (!needle || layout.name.toLowerCase().includes(needle)));
	});

	async function move(step: number) {
		const index = selected ? results.indexOf(selected) : -1;
		selected = results[Math.min(results.length - 1, Math.max(0, index + step))] ?? null;
		await tick();
		list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') move(1);
		else if (event.key === 'ArrowUp') move(-1);
		else if (event.key === 'Enter' && selected) onadd(selected);
		else return;
		event.preventDefault();
	}
</script>

<Dialog title="Add an input source" description="Pick the keyboard layout you want to type with." {onclose}>
	<input class="text-field" bind:value={query} placeholder="Search languages and layouts" onkeydown={keydown} />
	<div bind:this={list} class="soft-scroll -mx-2 flex h-[300px] flex-col gap-0.5 overflow-y-auto px-2" role="listbox" aria-label="Layouts">
		{#each results as layout (layout.id)}
			<button
				type="button"
				role="option"
				aria-selected={selected === layout}
				class="option"
				onclick={() => (selected = layout)}
				ondblclick={() => onadd(layout)}
			>
				<span class="truncate">{layout.name}</span>
				{#if selected === layout}
					<Check size={16} class="shrink-0" />
				{/if}
			</button>
		{:else}
			<p class="px-2.5 py-2 text-[13px] text-[var(--text-muted)]">Nothing matches “{query.trim()}”</p>
		{/each}
	</div>
	{#snippet actions()}
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!selected} onclick={() => selected && onadd(selected)}>Add</button>
	{/snippet}
</Dialog>

<style>
	.option {
		display: flex;
		min-height: 36px;
		flex: none;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		border-radius: 12px;
		padding-inline: 10px;
		text-align: left;
		font-size: 13px;
		color: var(--text-soft);
		transition: background-color 120ms var(--ease);
	}

	.option:hover {
		background: var(--surface-hover);
		color: var(--text);
	}

	.option[aria-selected='true'] {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
