<script lang="ts">
	import { selectionPill } from '@luft/ui';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import { resources } from '#lib/resources/registry.js';
	import { app, TASKS } from '#lib/state/app.svelte.js';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import ResourceEntry from './ResourceEntry.svelte';

	let entries = $derived(monitor.devices ? resources(monitor.devices, settings.value.showVirtual) : []);
</script>

<aside class="glass-sidebar drag-region px-3 pt-4 pb-3">
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" aria-label="Views" {@attach selectionPill()}>
		<button type="button" class="view" class:active={app.page === TASKS} aria-current={app.page === TASKS ? 'page' : undefined} onclick={() => app.open(TASKS)}>
			<LayoutGrid size={18} />
			<span class="truncate">Processes</span>
		</button>
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
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.view:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.view.active {
		background: transparent;
		color: var(--text);
	}
</style>
