<script lang="ts">
	import { SearchField } from '@luft/ui';
	import { searchPanels, shownGroups, titleOf, type Panel } from '#lib/panels/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { hardware, type Hardware } from '#lib/state/hardware.svelte.js';
	import { updates } from '#lib/state/updates.svelte.js';
	import SidebarProgress from '#lib/panels/updates/SidebarProgress.svelte';

	let present = $derived(hardware.present);
	let results = $derived(present ? (app.query.trim() ? [searchPanels(app.query, present)] : shownGroups(present)) : []);

	function openFirst(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const [first] = results.flat();
		if (first) app.open(first.id);
	}
</script>

{#snippet item(panel: Panel, present: Hardware)}
	<button
		type="button"
		class="nav-item"
		class:active={app.panel === panel.id}
		aria-current={app.panel === panel.id ? 'page' : undefined}
		onclick={() => app.open(panel.id)}
	>
		<panel.icon size={18} />
		<span class="truncate">{titleOf(panel, present)}</span>
		{#if panel.id === 'updates' && app.panel !== 'updates' && updates.activity.running}
			<SidebarProgress activity={updates.activity} />
		{/if}
	</button>
{/snippet}

<aside class="glass-sidebar drag-region gap-3.5 px-3 py-4">
	<SearchField variant="sidebar" label="Search settings" bind:value={app.query} onkeydown={openFirst} />
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
		{#if present}
			{#each results as group, index (index)}
				<div class="flex flex-col gap-0.5">
					{#each group as panel (panel.id)}
						{@render item(panel, present)}
					{/each}
				</div>
			{/each}
		{/if}
		{#if results.length === 1 && !results[0].length}
			<p class="px-3 text-[13px] text-[var(--sidebar-text-muted)]">Nothing matches that.</p>
		{/if}
	</nav>
</aside>

<style>
	.nav-item {
		position: relative;
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
</style>
