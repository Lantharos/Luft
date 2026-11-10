<script lang="ts">
	import { tick } from 'svelte';
	import { t } from '@luft/i18n';
	import { SearchField, selectionPill } from '@luft/ui';
	import type { Hardware } from '#lib/bindings.js';
	import { iconOf, search, shownGroups, titleOf, type Found } from '#lib/panels/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import { updates } from '#lib/state/updates.svelte.js';
	import SidebarProgress from '#lib/panels/system/updates/SidebarProgress.svelte';

	let nav = $state<HTMLElement>();
	let present = $derived(hardware.present);
	let searching = $derived(app.query.trim() !== '');
	let found = $derived(present && searching ? search(app.query, present) : []);
	let groups = $derived(present && !searching ? shownGroups(present) : []);

	$effect(() => {
		void app.query;
		void app.panel;
		void found;
		void tick().then(() => {
			const current = nav?.querySelector('[aria-current="page"]');
			if (current) current.scrollIntoView({ block: 'nearest' });
			else nav?.scrollTo({ top: 0 });
		});
	});

	function openFirst(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		const [first] = found;
		if (first) app.open(first.panel.id);
	}
</script>

{#snippet item({ panel, setting }: Found, present: Hardware)}
	{@const Icon = iconOf(panel, present)}
	<button
		type="button"
		class="nav-item"
		class:active={!setting && app.panel === panel.id}
		aria-current={!setting && app.panel === panel.id ? 'page' : undefined}
		onclick={() => app.open(panel.id)}
	>
		<Icon size={18} />
		{#if setting}
			<span class="flex min-w-0 flex-col">
				<span class="truncate text-[13.5px] leading-tight">{setting}</span>
				<span class="truncate text-[12px] leading-tight text-[var(--sidebar-text-muted)]">{titleOf(panel, present)}</span>
			</span>
		{:else}
			<span class="truncate">{titleOf(panel, present)}</span>
		{/if}
		{#if panel.id === 'system' && app.panel !== 'system' && updates.activity.running}
			<SidebarProgress activity={updates.activity} />
		{/if}
	</button>
{/snippet}

<aside class="glass-sidebar drag-region gap-3.5 px-3 py-4">
	<SearchField variant="sidebar" label={t('settings-search')} bind:value={app.query} onkeydown={openFirst} />
	<nav bind:this={nav} class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" {@attach selectionPill()}>
		{#if present}
			{#each groups as group (group.title)}
				<section class="flex flex-col gap-0.5">
					<h2 class="flex h-8 items-center px-3 text-[13px] font-medium text-[var(--sidebar-text-muted)]">{group.title}</h2>
					{#each group.panels as panel (panel.id)}
						{@render item({ panel, setting: null }, present)}
					{/each}
				</section>
			{/each}
			{#if searching}
				<section class="flex flex-col gap-0.5">
					{#each found as result (`${result.panel.id} ${result.setting}`)}
						{@render item(result, present)}
					{/each}
				</section>
			{/if}
		{/if}
		{#if searching && present && !found.length}
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
