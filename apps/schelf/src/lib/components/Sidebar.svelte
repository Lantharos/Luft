<script lang="ts">
	import type { Component } from 'svelte';
	import Compass from '@lucide/svelte/icons/compass';
	import HardDrive from '@lucide/svelte/icons/hard-drive';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import { SearchField } from '@luft/ui';
	import { CATEGORIES } from '$lib/catalog/categories';
	import { activity, percent } from '$lib/format';
	import { library } from '$lib/state/library.svelte';
	import { navigation, type Route } from '$lib/state/navigation.svelte';
	import { operations } from '$lib/state/operations.svelte';

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

{#snippet item(route: Route, title: string, Icon: Component, count?: number)}
	<button
		type="button"
		class="nav-item"
		class:active={active(route)}
		aria-current={active(route) ? 'page' : undefined}
		onclick={() => navigation.open(route)}
	>
		<Icon size={18} />
		<span class="flex-1 truncate">{title}</span>
		{#if count}
			<span class="count">{count}</span>
		{/if}
	</button>
{/snippet}

<aside class="glass-sidebar drag-region gap-3.5 px-3 py-4">
	<SearchField variant="sidebar" label="Search apps" bind:value={navigation.query} onkeydown={submit} />
	<nav class="hidden-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
		<div class="flex flex-col gap-0.5">
			{@render item({ page: 'discover' }, 'Discover', Compass)}
			{@render item({ page: 'installed' }, 'Installed', HardDrive)}
			{@render item({ page: 'updates' }, 'Updates', RefreshCw, library.updateCount)}
		</div>
		<div class="flex flex-col gap-0.5">
			{#each CATEGORIES as category (category.id)}
				{@render item({ page: 'category', category: category.id }, category.title, category.icon)}
			{/each}
		</div>
	</nav>
	{#if running}
		{@const value = percent(running)}
		<div class="activity">
			<div class="flex items-baseline justify-between gap-2">
				<span class="truncate">{activity(running)} {running.title}</span>
				{#if value !== null}
					<span class="tabular-nums text-[var(--sidebar-text-muted)]">{value}%</span>
				{/if}
			</div>
			<div class="track"><span class:indeterminate={value === null} style:width={value === null ? undefined : `${value}%`}></span></div>
			{#if remaining > 1}
				<span class="text-[12px] text-[var(--sidebar-text-muted)]">{remaining - 1} more waiting</span>
			{/if}
		</div>
	{/if}
</aside>

<style>
	.nav-item {
		display: flex;
		height: 38px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition: background-color 150ms var(--ease), color 150ms var(--ease), transform 150ms var(--ease);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.nav-item:active {
		transform: scale(0.97);
	}

	.count {
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--sidebar-text-muted);
	}

	.activity {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 4px 12px;
		font-size: 13px;
	}

	.track {
		height: 4px;
		overflow: hidden;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control);
	}

	.track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--accent);
		transition: width 240ms var(--ease);
	}

	.track .indeterminate {
		width: 30%;
		animation: slide 1.4s var(--ease) infinite;
	}

	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(340%);
		}
	}
</style>
