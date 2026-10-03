<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import { SearchField, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import type { DeadKey, Pair } from '../api';
	import type { LayoutEditor } from '../editor.svelte';
	import { pairProblems, typeable } from '../issues';
	import PairCell from './PairCell.svelte';

	interface Props {
		editor?: LayoutEditor;
		key: DeadKey;
		readonly?: boolean;
	}

	let { editor, key, readonly = false }: Props = $props();

	const CELL = 48;
	const GAP = 6;
	const MIN_WIDTH = 168;
	const TALLEST = 432;

	interface Item {
		pair: Pair;
		index: number;
	}

	let query = $state('');
	let width = $state(0);
	let scroller = $state<VirtualHandle>();
	let search = $state<SearchField>();

	let problems = $derived(editor && !readonly ? pairProblems(key, typeable(editor.layout)) : new Map<number, string>());
	let items = $derived.by<Item[]>(() => {
		const all = key.pairs.map((pair, index) => ({ pair, index }));
		const needle = query.trim();
		return needle ? all.filter(({ pair }) => pair.base.includes(needle) || pair.text.includes(needle) || pair.base.toLowerCase() === needle.toLowerCase()) : all;
	});
	let columns = $derived(Math.max(1, Math.floor((width + GAP) / (MIN_WIDTH + GAP))));
	let height = $derived(Math.min(TALLEST, Math.ceil(items.length / columns) * (CELL + GAP)));

	onMount(() => search?.focus());

	async function add() {
		if (!editor) return;
		query = '';
		editor.addPair(key.keysym);
		await tick();
		scroller?.scrollToIndex(key.pairs.length - 1);
		await tick();
		scroller?.element()?.querySelector<HTMLInputElement>(`[data-index="${key.pairs.length - 1}"] input`)?.focus();
	}
</script>

<section class="flex flex-col gap-3">
	<div class="flex items-center gap-2" data-own-undo>
		<div class="min-w-0 flex-1">
			<SearchField bind:this={search} label="Search results" bind:value={query} />
		</div>
		{#if editor && !readonly}
			<button type="button" class="plain-button" onclick={() => editor.addCapitals(key.keysym)}>Add capitals</button>
			<button type="button" class="button" onclick={() => void add()}><Plus size={16} />Add</button>
		{/if}
	</div>
	<div bind:clientWidth={width}>
		{#if items.length}
			<VirtualScroller
				bind:this={scroller}
				class="soft-scroll"
				style="height: {height}px"
				{items}
				key={(item) => String(item.index)}
				layout={{ itemHeight: CELL, minItemWidth: MIN_WIDTH, gap: GAP }}
			>
				{#snippet children(item)}
					<PairCell {editor} {key} pair={item.pair} index={item.index} problem={problems.get(item.index)} {readonly} />
				{/snippet}
			</VirtualScroller>
		{:else if key.pairs.length}
			<p class="px-1.5 text-[13px] text-[var(--text-muted)]">Nothing matches “{query.trim()}”</p>
		{:else}
			<p class="px-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
				Add what each key makes after this dead key, like a making ž. A result can also lead into another dead key.
			</p>
		{/if}
	</div>
</section>
