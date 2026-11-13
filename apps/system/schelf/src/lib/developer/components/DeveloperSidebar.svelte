<script lang="ts">
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import Globe from '@lucide/svelte/icons/globe';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import Store from '@lucide/svelte/icons/store';
	import UsersRound from '@lucide/svelte/icons/users-round';
	import type { Component } from 'svelte';
	import { selectionPill } from '@luft/ui';
	import NavItem from '#lib/components/NavItem.svelte';
	import { account } from '#lib/state/account.svelte.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { PUBLISHER_PAGES, type PublisherPage } from '../pages';
	import { developer } from '../state/developer.svelte';
	import ProjectMark from './ProjectMark.svelte';
	import PublisherMark from './PublisherMark.svelte';

	const PAGE_ICONS: Record<PublisherPage, Component> = { members: UsersRound, verification: ShieldCheck, domain: Globe, tools: SquareTerminal };

	const publisher = $derived(developer.publisher);
	const projects = $derived(publisher ? developer.projects(publisher.id) : null);
	const root = $derived(navigation.root);
	const pages = $derived((Object.entries(PUBLISHER_PAGES) as [PublisherPage, string][]).filter(([page]) => page !== 'members' || publisher?.kind === 'organisation'));
	const projectOpen = (id: string) => root.page === 'project' && root.id === id;

	$effect(() => projects?.watch());
</script>

<aside class="glass-sidebar drag-region gap-3.5 px-3 py-4">
	{#if publisher}
		<button type="button" class="publisher" onclick={() => account.show()}>
			<PublisherMark {publisher} />
			<span class="min-w-0 flex-1 truncate">{publisher.name}</span>
			<ChevronsUpDown size={16} class="text-[var(--sidebar-text-muted)]" />
		</button>
	{/if}
	<nav class="hidden-scroll scroll-fade flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" {@attach selectionPill()}>
		<div class="flex flex-col gap-0.5">
			{#each projects?.data ?? [] as project (project.id)}
				<NavItem
					title={project.name}
					active={projectOpen(project.id)}
					onclick={() => navigation.open({ page: 'project', id: project.id, tab: 'overview' })}
				>
					{#snippet leading()}<ProjectMark {project} />{/snippet}
				</NavItem>
			{/each}
		</div>
		<div class="flex flex-col gap-0.5">
			{#each pages as [page, title] (page)}
				<NavItem
					{title}
					icon={PAGE_ICONS[page]}
					active={root.page === 'publisher' && root.section === page}
					onclick={() => navigation.open({ page: 'publisher', section: page })}
				/>
			{/each}
		</div>
	</nav>
	<NavItem title="Back to the store" icon={Store} onclick={() => developer.leave()} />
</aside>

<style>
	.publisher {
		display: flex;
		height: 44px;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 8px 12px;
		text-align: left;
		font-size: 14px;
		font-weight: 600;
		transition: background-color var(--motion-tap) var(--ease-decelerate);
	}

	.publisher:hover {
		background: var(--sidebar-control);
	}
</style>
