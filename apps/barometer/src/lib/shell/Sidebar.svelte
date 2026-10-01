<script lang="ts">
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import ListTree from '@lucide/svelte/icons/list-tree';
	import type { Component } from 'svelte';
	import { resources } from '$lib/resources/registry';
	import { app } from '$lib/state/app.svelte';
	import { monitor } from '$lib/state/monitor.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import ResourceEntry from './ResourceEntry.svelte';

	let entries = $derived(monitor.devices ? resources(monitor.devices, settings.value.showVirtual) : []);
</script>

{#snippet view(page: string, title: string, Icon: Component)}
	<button type="button" class="view" class:active={app.page === page} aria-current={app.page === page ? 'page' : undefined} onclick={() => app.open(page)}>
		<Icon size={18} />
		<span class="truncate">{title}</span>
	</button>
{/snippet}

<aside class="glass-sidebar drag-region px-3 pt-4 pb-3">
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" aria-label="Views">
		<div class="flex flex-col gap-0.5">
			{@render view('apps', 'Apps', LayoutGrid)}
			{@render view('processes', 'Processes', ListTree)}
		</div>
		<div class="flex flex-col gap-1">
			{#each entries as resource (resource.id)}
				<ResourceEntry {resource} />
			{/each}
		</div>
	</nav>
</aside>

<style>
	.view {
		display: flex;
		height: 38px;
		width: 100%;
		flex: none;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 14px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease),
			transform 150ms var(--ease);
	}

	.view:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.view.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.view:active {
		transform: scale(0.97);
	}
</style>
