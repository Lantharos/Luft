<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { PANEL_GROUPS, searchPanels, type Panel } from '$lib/panels/registry';
	import { app } from '$lib/state/app.svelte';

	let results = $derived(app.query.trim() ? [searchPanels(app.query)] : PANEL_GROUPS);

	function openFirst(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const [first] = results.flat();
		if (first) app.open(first.id);
	}
</script>

{#snippet item(panel: Panel)}
	<button
		type="button"
		class="nav-item"
		class:active={app.panel === panel.id}
		aria-current={app.panel === panel.id ? 'page' : undefined}
		onclick={() => app.open(panel.id)}
	>
		<panel.icon size={18} />
		<span class="truncate">{panel.title}</span>
	</button>
{/snippet}

<aside class="settings-sidebar drag-region" data-effect={app.translucent ? 'translucent' : 'solid'}>
	<label class="search" data-no-drag>
		<Search size={16} class="shrink-0 text-[var(--sidebar-text-muted)]" />
		<input type="search" placeholder="Search settings" bind:value={app.query} onkeydown={openFirst} />
	</label>
	<nav class="hidden-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" data-no-drag>
		{#each results as group, index (index)}
			<div class="flex flex-col gap-0.5">
				{#each group as panel (panel.id)}
					{@render item(panel)}
				{/each}
			</div>
		{/each}
		{#if results.length === 1 && !results[0].length}
			<p class="px-3 text-[13px] text-[var(--sidebar-text-muted)]">Nothing matches that.</p>
		{/if}
	</nav>
</aside>

<style>
	.search {
		display: flex;
		height: 38px;
		flex: none;
		align-items: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control);
		padding-inline: 12px;
		transition: background-color 160ms var(--ease);
	}

	.search:hover,
	.search:focus-within {
		background: var(--sidebar-control-hover);
	}

	.search input {
		min-width: 0;
		flex: 1;
		background: transparent;
		font-size: 13px;
		outline: none;
		color: var(--sidebar-text);
	}

	.search input::placeholder {
		color: var(--sidebar-text-muted);
	}

	.search input::-webkit-search-cancel-button {
		display: none;
	}

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
		background: var(--sidebar-active);
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
