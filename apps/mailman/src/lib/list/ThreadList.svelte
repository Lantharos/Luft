<script lang="ts">
	import { VirtualScroller, type VirtualHandle } from '@luft/ui';
	import type { ThreadRow as Row } from '$lib/api';
	import { navigate, openThread } from '$lib/app/navigation';
	import { composer } from '$lib/compose/composer.svelte';
	import * as actions from '$lib/mail/actions';
	import { list, type Item } from '$lib/mail/list.svelte';
	import LaterPopover from '$lib/shell/LaterPopover.svelte';
	import EmptyList from './EmptyList.svelte';
	import RowMenu from './RowMenu.svelte';
	import SummaryRow from './SummaryRow.svelte';
	import ThreadRow from './ThreadRow.svelte';

	const LAYOUT = { itemHeight: 80, gap: 2, padding: { top: 2, right: 8, bottom: 16, left: 8 } };
	const NEAR_END = 1200;

	let scroller = $state<VirtualHandle>();
	let menu = $state<{ row: Row; at: { x: number; y: number } } | null>(null);
	let later = $state<{ row: Row; anchor: HTMLElement } | null>(null);

	$effect(() => {
		if (list.index >= 0) scroller?.scrollToIndex(list.index + list.summaries.length);
	});

	function key(item: Item) {
		return item.kind === 'thread' ? `t${item.row.thread}` : `s${item.summary.view}`;
	}

	function scrolled(event: Event) {
		const element = event.currentTarget as HTMLElement;
		if (element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_END) void list.more();
	}
</script>

<section class="flex min-h-0 flex-1 flex-col" aria-label="Conversations">
	{#if list.items.length}
		<VirtualScroller bind:this={scroller} class="soft-scroll min-h-0 flex-1" items={list.items} {key} layout={LAYOUT} stableOrder role="listbox" style="overflow-x: hidden" onscroll={scrolled}>
			{#snippet children(item)}
				{#if item.kind === 'summary'}
					<SummaryRow summary={item.summary} onopen={() => navigate(item.summary.view)} />
				{:else}
					{@const row = item.row}
					<ThreadRow
						{row}
						selected={list.selected === row.thread}
						onopen={() => (row.draft && list.view === 'drafts' ? void composer.reopen(row.id) : void openThread(row.thread))}
						onarchive={() => actions.move('archive', [row.thread])}
						ontrash={() => actions.move(list.view === 'trash' ? 'deleteForever' : 'trash', [row.thread])}
						onlater={(anchor) => (later = { row, anchor })}
						onmenu={(event) => (menu = { row, at: { x: event.clientX, y: event.clientY } })}
					/>
				{/if}
			{/snippet}
		</VirtualScroller>
	{:else if !list.loading}
		<EmptyList />
	{/if}
</section>

{#if menu}
	{#key menu}
		<RowMenu row={menu.row} at={menu.at} onclose={() => (menu = null)} />
	{/key}
{/if}

{#if later}
	<LaterPopover anchor={later.anchor} onpick={(at) => actions.snooze(at, [later!.row.thread])} onclose={() => (later = null)} />
{/if}
