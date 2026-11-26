<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Component } from 'svelte';
	import Compass from '@luft/symbols/icons/compass';
	import HardDrive from '@luft/symbols/icons/hard-drive';
	import Puzzle from '@luft/symbols/icons/puzzle';
	import RefreshCw from '@luft/symbols/icons/refresh-cw';
	import UserRound from '@luft/symbols/icons/user-round';
	import { ProgressBar, SearchField, selectionPill } from '@luft/ui';
	import { CATEGORIES, categoryTitle } from '#lib/catalog/categories.js';
	import NavItem from '#lib/components/NavItem.svelte';
	import { developer } from '#lib/developer/state/developer.svelte.js';
	import { account } from '#lib/state/account.svelte.js';
	import { namedActivity, percent, percentText } from '#lib/format.js';
	import { library } from '#lib/state/library.svelte.js';
	import { navigation, type Route } from '#lib/state/navigation.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';

	const SEARCH_DELAY_MS = 250;

	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const query = navigation.query;
		clearTimeout(timer);
		timer = setTimeout(() => navigation.search(query), SEARCH_DELAY_MS);
		return () => clearTimeout(timer);
	});

	function active(route: Route) {
		const root = navigation.root;
		if (route.page === 'category') return root.page === 'category' && root.category === route.category;
		return root.page === route.page;
	}

	function submit(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		clearTimeout(timer);
		navigation.search(navigation.query);
	}

	const running = $derived(operations.running && !operations.isInline(operations.running.id) ? operations.running : null);
	const remaining = $derived(operations.pending);
</script>

{#snippet item(route: Route, title: string, icon: Component, count?: number)}
	<NavItem {title} {icon} {count} active={active(route)} onclick={() => navigation.open(route)} />
{/snippet}

<aside class="glass-sidebar drag-region gap-3.5 p-(--sheet-inset)">
	<SearchField variant="sidebar" label={t('sidebar-search')} bind:value={navigation.query} onkeydown={submit} />
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" {@attach selectionPill()}>
		<div class="flex flex-col gap-0.5">
			{@render item({ page: 'discover' }, t('sidebar-discover'), Compass)}
			{@render item({ page: 'installed' }, t('sidebar-installed'), HardDrive)}
			{@render item({ page: 'updates' }, t('sidebar-updates'), RefreshCw, library.updateCount)}
			{@render item({ page: 'extensions' }, t('sidebar-extensions'), Puzzle)}
		</div>
		<div class="flex flex-col gap-0.5">
			{#each CATEGORIES as category (category.id)}
				{@render item({ page: 'category', category: category.id }, categoryTitle(category.id), category.icon)}
			{/each}
		</div>
	</nav>
	{#if running}
		{@const value = percent(running)}
		<div class="activity">
			<div class="flex items-baseline justify-between gap-2">
				<span class="truncate">{namedActivity(running)}</span>
				{#if value !== null}
					<span class="tabular-nums text-[var(--sidebar-text-muted)]">{percentText(value)}</span>
				{/if}
			</div>
			<ProgressBar fraction={running.progress?.fraction ?? null} class="h-1 bg-[var(--sidebar-control)]" />
			{#if remaining > 1}
				<span class="text-[12px] text-[var(--sidebar-text-muted)]">{t('operation-more-waiting', { count: remaining - 1 })}</span>
			{/if}
		</div>
	{/if}
	<NavItem
		title={account.signedIn ? account.signedIn.name || account.signedIn.email : t('sidebar-account')}
		icon={UserRound}
		onclick={() => (developer.publisher ? developer.enter() : account.show())}
	/>
</aside>

<style>
	.activity {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 4px 12px;
		font-size: 13px;
	}
</style>
