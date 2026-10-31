<script lang="ts">
	import { t } from '@luft/i18n';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { errorText, Row, SearchField, Section, Segmented } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Order, StorePage } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import StoreItem from './StoreItem.svelte';

	interface Props {
		onclose: () => void;
	}

	let { onclose }: Props = $props();

	const SEARCH_DELAY_MS = 350;
	const PLACEHOLDERS = 6;

	const desktop = useSettings<{ 'cursor-theme': string }>('org.gnome.desktop.interface', ['cursor-theme']);

	let subPage = $state<ReturnType<typeof SubPage>>();
	let search = $state('');
	let query = $state('');
	let order = $state<Order>('popular');
	let page = $state(0);
	let result = $state<StorePage | null>(null);
	let loading = $state(true);
	let problem = $state('');
	let request = 0;

	let orders = $derived<{ value: Order; label: string }[]>([
		{ value: 'popular', label: t('settings-cursors-order-popular') },
		{ value: 'rating', label: t('settings-cursors-order-rating') },
		{ value: 'newest', label: t('settings-cursors-order-newest') }
	]);

	async function load(query: string, order: Order, page: number) {
		const current = ++request;
		loading = true;
		problem = '';
		try {
			const next = await commands.appearanceCursorStore({ search: query, order, page });
			if (current === request) result = next;
		} catch (reason) {
			if (current === request) problem = errorText(reason);
		} finally {
			if (current === request) loading = false;
		}
	}

	function turn(to: number) {
		page = to;
		subPage?.reveal();
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
</script>

<SubPage bind:this={subPage} title={t('settings-cursors-store')} back={t('settings-cursors')} {onclose}>
	<div class="flex items-center gap-3">
		<div class="min-w-0 flex-1">
			<SearchField bind:value={search} label={t('settings-cursors-search')} />
		</div>
		<Segmented
			label={t('settings-cursors-order')}
			options={orders}
			value={order}
			onchange={(value) => {
				order = value;
				page = 0;
			}}
		/>
	</div>

	{#if problem}
		<Section>
			<Row title={t('settings-cursors-load-failed')} description={problem}>
				<button type="button" class="button" onclick={() => load(query, order, page)}>{t('settings-cursors-try-again')}</button>
			</Row>
		</Section>
	{:else if result && !result.items.length && !loading}
		<Section>
			<Row title={query ? t('settings-cursors-no-match', { query }) : t('settings-cursors-empty')} description={t('settings-cursors-no-match-description')} />
		</Section>
	{:else}
		<Section description={t('settings-cursors-store-description')}>
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
				{t('settings-cursors-previous')}
			</button>
			<span class="px-2 text-[13px] text-[var(--text-muted)] tabular-nums">{t('settings-cursors-page', { page: page + 1, pages: result.pages })}</span>
			<button type="button" class="plain-button" disabled={page + 1 >= result.pages || loading} onclick={() => turn(page + 1)}>
				{t('settings-cursors-next')}
				<ChevronRight size={16} />
			</button>
		</div>
	{/if}
</SubPage>

<style>
	.results {
		transition: opacity var(--motion-quick) var(--ease-decelerate);
	}

	.results.loading {
		opacity: 0.55;
	}

	.results > :global(* + *) {
		box-shadow: inset 0 1px 0 var(--hairline);
	}

	.placeholder {
		height: 88px;
		animation: pulse 1.4s var(--ease-decelerate) infinite alternate;
		background: var(--surface);
	}

	@keyframes pulse {
		to {
			opacity: 0.4;
		}
	}
</style>
