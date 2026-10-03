<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import { Dialog, SearchField, TextField, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { toast } from '#lib/state/toast.svelte.js';
	import { createLayout, importLayout, systemLayouts, type Entry, type Layout, type Origin } from './api';

	interface Props {
		from: string | null;
		oncreated: (layout: Layout) => void;
		onclose: () => void;
	}

	let { from, oncreated, onclose }: Props = $props();

	interface Choice {
		key: string;
		name: string;
		origin: Origin;
	}

	let system = $state.raw<Entry[]>([]);
	let query = $state('');
	let typed = $state<string | null>(null);
	let chosen = $state<Choice | null>(null);
	let busy = $state(false);
	let list = $state<VirtualHandle>();
	let field = $state<TextField>();

	let choices = $derived<Choice[]>([
		...app.layouts.map((layout) => ({ key: `user:${layout.id}`, name: layout.name, origin: { kind: 'user', id: layout.id } as Origin })),
		...system.map((layout) => ({ key: `system:${layout.id}`, name: layout.name, origin: { kind: 'system', id: layout.id } as Origin }))
	]);
	let name = $derived(typed ?? (chosen ? `${chosen.name} (custom)` : ''));
	let results = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return needle ? choices.filter((choice) => choice.name.toLowerCase().includes(needle)) : choices;
	});

	void systemLayouts().then(async (layouts) => {
		system = layouts;
		const preferred = from ?? app.sources.find(([type]) => type === 'xkb')?.[1] ?? 'us';
		const found = choices.find((choice) => choice.origin.id === preferred);
		if (found) {
			chosen = found;
			await tick();
			list?.scrollToIndex(results.indexOf(found), 'center');
		}
	});

	onMount(() => field?.focus());

	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		void create();
	}

	async function create() {
		if (!chosen || busy) return;
		busy = true;
		try {
			oncreated(await createLayout(name, chosen.origin));
		} catch (error) {
			toast.failed(error);
		} finally {
			busy = false;
		}
	}

	async function importFile() {
		try {
			const imported = await importLayout();
			if (imported) oncreated(imported);
		} catch (error) {
			toast.failed(error);
		}
	}
</script>

<Dialog title="New layout" description="Start from a layout that's close to what you want, then change the keys you need." wide {onclose}>
	<div class="flex flex-col gap-4">
		<TextField bind:this={field} label="Name" showLabel bind:value={() => name, (value) => (typed = value)} onkeydown={keydown} />
		<div class="flex flex-col gap-2">
			<span class="px-1 text-[13px] text-[var(--text-soft)]">Start from</span>
			<SearchField label="Search layouts" bind:value={query} />
			<VirtualScroller bind:this={list} class="hidden-scroll scroll-fade h-[260px]" items={results} key={(choice) => choice.key} layout={{ itemHeight: 36, gap: 2 }}>
				{#snippet children(choice)}
					<button type="button" class="option" aria-selected={chosen?.key === choice.key} role="option" onclick={() => (chosen = choice)} ondblclick={() => void create()}>
						<span class="truncate">{choice.name}</span>
						{#if chosen?.key === choice.key}
							<Check size={16} class="shrink-0" />
						{/if}
					</button>
				{/snippet}
			</VirtualScroller>
		</div>
	</div>
	{#snippet actions()}
		<button type="button" class="plain-button mr-auto" onclick={() => void importFile()}>Import a file</button>
		<button type="button" class="button" onclick={onclose}>Cancel</button>
		<button type="button" class="button primary" disabled={!chosen || !name.trim() || busy} onclick={() => void create()}>Create</button>
	{/snippet}
</Dialog>

<style>
	.option {
		display: flex;
		width: 100%;
		height: 36px;
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

	.option:hover,
	.option[aria-selected='true'] {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
