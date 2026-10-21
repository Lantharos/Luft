<script lang="ts">
	import { t } from '@luft/i18n';
	import { SearchField, selectionPill } from '@luft/ui';
	import { searchPanels, shownGroups, titleOf, type Panel } from '#lib/panels/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { hardware, type Hardware } from '#lib/state/hardware.svelte.js';
	import { updates } from '#lib/state/updates.svelte.js';
	import SidebarProgress from '#lib/panels/system/updates/SidebarProgress.svelte';

	let nav = $state<HTMLElement>();
	let present = $derived(hardware.present);
	let results = $derived(present ? (app.query.trim() ? [{ title: '', panels: searchPanels(app.query, present) }] : shownGroups(present)) : []);

	$effect(() => {
		void app.query;
		nav?.scrollTo({ top: 0 });
	});

	function openFirst(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const [first] = results.flatMap((group) => group.panels);
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
		{#if panel.id === 'system' && app.panel !== 'system' && updates.activity.running}
			<SidebarProgress activity={updates.activity} />
		{/if}
	</button>
{/snippet}

<aside class="glass-sidebar drag-region gap-3.5 px-3 py-4">
	<SearchField variant="sidebar" label={t('settings-search')} bind:value={app.query} onkeydown={openFirst} />
	<nav bind:this={nav} class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" {@attach selectionPill()}>
		{#if present}
			{#each results as group, index (index)}
				<section class="flex flex-col gap-0.5">
					{#if group.title}
						<h2 class="flex h-8 items-center px-3 text-[13px] font-medium text-[var(--sidebar-text-muted)]">{group.title}</h2>
					{/if}
					{#each group.panels as panel (panel.id)}
						{@render item(panel, present)}
					{/each}
				</section>
			{/each}
		{/if}
		{#if results.length === 1 && !results[0].panels.length}
			<p class="px-3 text-[13px] text-[var(--sidebar-text-muted)]">{t('settings-search-empty')}</p>
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
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate), transform var(--motion-tap) var(--ease-decelerate);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: transparent;
		color: var(--text);
	}

	.nav-item:active {
		transform: scale(0.97);
	}
</style>
