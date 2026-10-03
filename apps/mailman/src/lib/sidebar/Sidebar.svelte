<script lang="ts">
	import { untrack } from 'svelte';
	import { SearchField, tooltip } from '@luft/ui';
	import PenLine from '@lucide/svelte/icons/pen-line';
	import Settings from '@lucide/svelte/icons/settings-2';
	import { composer } from '$lib/compose/composer.svelte';
	import { list } from '$lib/mail/list.svelte';
	import { mail } from '$lib/mail/mail.svelte';
	import { BUNDLES, PRIMARY, mailboxView } from '$lib/mail/views';
	import { step } from '$lib/app/commands';
	import { navigate } from '$lib/app/navigation';
	import AccountStatus from './AccountStatus.svelte';
	import NavItem from './NavItem.svelte';

	interface Props {
		onsettings: () => void;
	}

	let { onsettings }: Props = $props();

	let search = $state<{ focus: () => void }>();
	let query = $state('');
	let timer: ReturnType<typeof setTimeout> | undefined;

	let primary = $derived(PRIMARY.filter((view) => view.id !== 'screener' || mail.settings.screener || mail.counts.screener > 0));
	let multiple = $derived(mail.accounts.length > 1);

	$effect(() => {
		void list.view;
		untrack(() => (query = ''));
	});

	export function focusSearch() {
		search?.focus();
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

<aside class="glass-sidebar drag-region sidebar">
	<div class="flex h-[60px] flex-none items-center gap-2 px-3">
		<button type="button" class="write" onclick={() => composer.start()} {@attach tooltip('Write (C)')}>
			<PenLine size={16} />
			<span>Write</span>
		</button>
		<button type="button" class="icon-button" aria-label="Settings" onclick={onsettings} {@attach tooltip('Settings')}>
			<Settings size={18} />
		</button>
	</div>
	<div class="flex-none px-3 pb-3">
		<SearchField bind:this={search} bind:value={query} label="Search mail" variant="sidebar" onkeydown={searchKey} />
	</div>
	<nav class="scroll-fade soft-scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 pb-3">
		<div class="flex flex-col gap-px">
			{#each primary as view (view.id)}
				<NavItem
					label={view.label}
					icon={view.icon}
					active={list.view === view.id && !list.searching}
					count={view.count?.(mail.counts) ?? 0}
					strong={!view.total}
					onclick={() => navigate(view.id)}
				/>
			{/each}
		</div>
		{#if mail.settings.bundles}
			<div class="flex flex-col gap-px">
				<p class="group">Bundles</p>
				{#each BUNDLES as view (view.id)}
					<NavItem label={view.label} icon={view.icon} active={list.view === view.id && !list.searching} count={view.count?.(mail.counts) ?? 0} onclick={() => navigate(view.id)} />
				{/each}
			</div>
		{/if}
		{#each mail.accounts as account (account.id)}
			{@const folders = mail.folders(account.id)}
			{#if folders.length}
				<div class="flex flex-col gap-px">
					<p class="group truncate">{multiple ? account.email : 'Folders'}</p>
					{#each folders as folder (folder.id)}
						{@const view = mailboxView(folder)}
						<NavItem label={view.label} icon={view.icon} active={list.view === view.id && !list.searching} count={mail.unreadIn(folder.id)} onclick={() => navigate(view.id)} />
					{/each}
				</div>
			{/if}
		{/each}
	</nav>
	<AccountStatus />
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
			filter 160ms var(--ease),
			transform 160ms var(--ease);
	}

	.write:hover {
		filter: brightness(1.08);
	}

	.write:active {
		transform: scale(0.97);
	}

	.group {
		padding: 6px 12px 4px;
		font-size: 12px;
		font-weight: 500;
		color: var(--sidebar-text-muted);
	}
</style>
