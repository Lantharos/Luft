<script lang="ts">
	import { untrack } from 'svelte';
	import { SearchField, selectionPill, tooltip } from '@luft/ui';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Search from '@lucide/svelte/icons/search';
	import Settings from '@lucide/svelte/icons/settings-2';
	import type { Account } from '#lib/bindings.js';
	import { composer } from '#lib/compose/composer.svelte.js';
	import { list } from '#lib/mail/list.svelte.js';
	import { mail } from '#lib/mail/mail.svelte.js';
	import { BUNDLES, PRIMARY, mailboxView } from '#lib/mail/views.js';
	import { step } from '#lib/app/commands.js';
	import { navigate } from '#lib/app/navigation.js';
	import AccountStatus from './AccountStatus.svelte';
	import NavItem from './NavItem.svelte';

	interface Props {
		rail: boolean;
		onsettings: () => void;
		onsearch: () => void;
		onsignin: (account: Account) => void;
	}

	let { rail, onsettings, onsearch, onsignin }: Props = $props();

	let search = $state<{ focus: () => void }>();
	let query = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	let primary = $derived(PRIMARY.filter((view) => view.id !== 'screener' || mail.settings.screener));
	let multiple = $derived(mail.accounts.length > 1);

	$effect(() => {
		void list.view;
		untrack(() => (query = ''));
	});

	export function focusSearch() {
		if (rail) onsearch();
		else search?.focus();
	}

	function searchKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			query = '';
			void list.search('');
			(event.currentTarget as HTMLElement).blur();
		} else if (event.key === 'Enter' || event.key === 'ArrowDown') {
			event.preventDefault();
			(event.currentTarget as HTMLElement).blur();
			void list.search(query).then(() => step(1));
		}
	}

	$effect(() => {
		const value = query;
		clearTimeout(timer);
		if (value === list.query) return;
		timer = setTimeout(() => void list.search(value), 120);
	});
</script>

<aside class="glass-sidebar drag-region">
	<div class="flex h-[60px] flex-none items-center gap-2 px-3">
		<button type="button" class="write" class:rail aria-label={rail ? 'Write' : undefined} onclick={() => composer.start()} {@attach tooltip('Write (C)')}>
			<PenLine size={rail ? 18 : 16} />
			{#if !rail}<span>Write</span>{/if}
		</button>
		{#if !rail}
			<button type="button" class="icon-button" aria-label="Settings" onclick={onsettings} {@attach tooltip('Settings')}>
				<Settings size={18} />
			</button>
		{/if}
	</div>
	{#if !rail}
		<div class="flex-none px-3 pb-3">
			<SearchField bind:this={search} bind:value={query} label="Search mail" variant="sidebar" onkeydown={searchKey} />
		</div>
	{/if}
	<nav class="scroll-fade flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3" class:hidden-scroll={rail} class:soft-scroll={!rail} {@attach selectionPill()}>
		{#if rail}
			<NavItem label="Search mail" icon={Search} active={list.searching} {rail} onclick={onsearch} />
		{/if}
		<div class="flex flex-col gap-px">
			{#each primary as view (view.id)}
				<NavItem
					label={view.label}
					icon={view.icon}
					active={list.view === view.id && !list.searching}
					count={view.count?.(mail.counts) ?? 0}
					strong={!view.total}
					{rail}
					onclick={() => navigate(view.id)}
				/>
			{/each}
		</div>
		{#if mail.settings.bundles}
			<div class="flex flex-col gap-px">
				{#if !rail}<p class="group">Bundles</p>{/if}
				{#each BUNDLES as view (view.id)}
					<NavItem label={view.label} icon={view.icon} active={list.view === view.id && !list.searching} count={view.count?.(mail.counts) ?? 0} {rail} onclick={() => navigate(view.id)} />
				{/each}
			</div>
		{/if}
		{#each mail.accounts as account (account.id)}
			{@const folders = mail.folders(account.id)}
			{#if folders.length}
				<div class="flex flex-col gap-px">
					{#if !rail}<p class="group truncate">{multiple ? account.email : 'Folders'}</p>{/if}
					{#each folders as folder (folder.id)}
						{@const view = mailboxView(folder)}
						<NavItem label={view.label} icon={view.icon} active={list.view === view.id && !list.searching} count={mail.unreadIn(folder.id)} {rail} onclick={() => navigate(view.id)} />
					{/each}
				</div>
			{/if}
		{/each}
	</nav>
	{#if rail}
		<div class="flex flex-none justify-center pb-3">
			<button type="button" class="icon-button large" aria-label="Settings" onclick={onsettings} {@attach tooltip('Settings')}>
				<Settings size={18} />
			</button>
		</div>
	{/if}
	<AccountStatus {rail} {onsignin} />
</aside>

<style>
	.write {
		display: flex;
		height: 38px;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border-radius: var(--radius-pill);
		background: var(--accent);
		color: var(--accent-text);
		font-size: 14px;
		font-weight: 600;
		text-shadow: none;
		transition:
			filter var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.write:hover {
		background: var(--accent-hover);
	}

	.write:active {
		transform: scale(0.97);
	}

	.write.rail {
		height: 44px;
		width: 48px;
		flex: none;
	}

	.group {
		padding: 6px 12px 4px;
		font-size: 12px;
		font-weight: 500;
		color: var(--sidebar-text-muted);
	}
</style>
