<script lang="ts">
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { onMount } from 'svelte';
	import { IconButton, Row, SearchField, Section, Segmented } from '@luft/ui';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { browseCursors, type Order, type StorePage } from './api';
	import StoreItem from './StoreItem.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const SEARCH_DELAY_MS = 350;
	const PLACEHOLDERS = 6;
	const ORDERS: { value: Order; label: string }[] = [
		{ value: 'popular', label: 'Popular' },
		{ value: 'rating', label: 'Top rated' },
		{ value: 'newest', label: 'New' }
	];

	const desktop = useSettings<{ 'cursor-theme': string }>('org.gnome.desktop.interface', ['cursor-theme']);

	let root = $state<HTMLDivElement>();
	let search = $state('');
	let query = $state('');
	let order = $state<Order>('popular');
	let page = $state(0);
	let result = $state<StorePage | null>(null);
	let loading = $state(true);
	let problem = $state('');
	let request = 0;

	async function load(query: string, order: Order, page: number) {
		const current = ++request;
		loading = true;
		problem = '';
		try {
			const next = await browseCursors(query, order, page);
			if (current === request) result = next;
		} catch (reason) {
			if (current === request) problem = reason instanceof Error ? reason.message : String(reason);
		} finally {
			if (current === request) loading = false;
		}
	}

	function turn(to: number) {
		page = to;
		root?.scrollIntoView({ block: 'start' });
	}

	$effect(() => {
		const value = search.trim();
		const timer = setTimeout(() => {
			query = value;
			page = 0;
		}, SEARCH_DELAY_MS);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		void load(query, order, page);
	});

	onMount(() => root?.scrollIntoView({ block: 'start' }));
</script>

<div bind:this={root} class="flex scroll-mt-4 flex-col gap-7">
	<div class="-mb-2 flex items-center gap-3">
		<IconButton icon={ArrowLeft} label="Back to Appearance" onclick={onclose} />
		<h2 class="min-w-0 flex-1 truncate text-[17px] font-semibold">Get cursors</h2>
	</div>

	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1">
			<SearchField bind:value={search} label="Search cursors" />
		</div>
		<Segmented
			label="Order"
			options={ORDERS}
			value={order}
			onchange={(value) => {
				order = value;
				page = 0;
			}}
		/>
	</div>

	{#if problem}
		<Section>
			<Row title="Cursors can't be loaded" description={problem}>
				<button type="button" class="button" onclick={() => load(query, order, page)}>Try again</button>
			</Row>
		</Section>
	{:else if result && !result.items.length && !loading}
		<Section>
			<Row title={query ? `Nothing matches “${query}”` : 'No cursors here yet'} description="Try a shorter search or another word" />
		</Section>
	{:else}
		<Section description="Themes shared by the GNOME-Look community">
			<div class="results" class:loading>
				{#if result}
					{#each result.items as item (item.id)}
						<StoreItem {item} current={desktop.values['cursor-theme'] ?? ''} onuse={(theme) => desktop.set('cursor-theme', theme)} />
					{/each}
				{:else}
					{#each { length: PLACEHOLDERS } as _, index (index)}
						<div class="placeholder"></div>
					{/each}
				{/if}
			</div>
		</Section>
	{/if}

	{#if result && result.pages > 1 && !problem}
		<div class="-mt-3 flex items-center justify-center gap-2">
			<button type="button" class="plain-button" disabled={page === 0 || loading} onclick={() => turn(page - 1)}>
				<ChevronLeft size={16} />
				Previous
			</button>
			<span class="px-2 text-[13px] text-[var(--text-muted)] tabular-nums">Page {page + 1} of {result.pages}</span>
			<button type="button" class="plain-button" disabled={page + 1 >= result.pages || loading} onclick={() => turn(page + 1)}>
				Next
				<ChevronRight size={16} />
			</button>
		</div>
	{/if}
</div>

<style>
	.results {
		transition: opacity 180ms var(--ease);
	}

	.results.loading {
		opacity: 0.55;
	}

	.results > :global(* + *) {
		box-shadow: inset 0 1px 0 var(--hairline);
	}

	.placeholder {
		height: 88px;
		animation: pulse 1.4s var(--ease) infinite alternate;
		background: var(--surface);
	}

	@keyframes pulse {
		to {
			opacity: 0.4;
		}
	}
</style>
