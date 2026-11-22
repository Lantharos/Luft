<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '@luft/i18n';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { appearance, GlassShell, IconButton, PageStack, TitleBar, Toast } from '@luft/ui';
	import AccessNotice from '#lib/account/AccessNotice.svelte';
	import AccountDialog from '#lib/account/AccountDialog.svelte';
	import OpenFailedDialog from '#lib/components/OpenFailedDialog.svelte';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import ApprovalDialog from '#lib/developer/components/ApprovalDialog.svelte';
	import DeveloperSidebar from '#lib/developer/components/DeveloperSidebar.svelte';
	import Project from '#lib/developer/pages/project/Project.svelte';
	import Publisher from '#lib/developer/pages/publisher/Publisher.svelte';
	import Release from '#lib/developer/pages/release/Release.svelte';
	import { approvals } from '#lib/developer/state/approval.svelte.js';
	import { developer } from '#lib/developer/state/developer.svelte.js';
	import AppPage from '#lib/pages/app/AppPage.svelte';
	import Browse from '#lib/pages/browse/Browse.svelte';
	import Discover from '#lib/pages/discover/Discover.svelte';
	import Installed from '#lib/pages/installed/Installed.svelte';
	import Search from '#lib/pages/search/Search.svelte';
	import Sources from '#lib/pages/sources/Sources.svelte';
	import Updates from '#lib/pages/updates/Updates.svelte';
	import { account } from '#lib/state/account.svelte.js';
	import { start } from '#lib/state/app.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { opening } from '#lib/state/opening.svelte.js';
	import { title } from '#lib/state/titles.js';

	let ready = $state(false);

	const route = $derived(navigation.route);
	const depth = $derived(navigation.stack.length);
	const heading = $derived(title(route));

	onMount(() => {
		void start().then(() => (ready = true));
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	function keys(event: KeyboardEvent) {
		if ((event.altKey && event.key === 'ArrowLeft') || (event.key === 'Escape' && depth > 1 && !document.querySelector('[role="dialog"]'))) navigation.back();
	}
</script>

{#snippet backButton()}
	<IconButton icon={ChevronLeft} label={t('title-back')} large onclick={() => navigation.back()} />
{/snippet}

<svelte:window onkeydown={keys} />

<GlassShell>
	{#if navigation.developing}
		<DeveloperSidebar />
	{:else}
		<Sidebar />
	{/if}
	<main class="glass-content">
		<TitleBar title={heading} leading={depth > 1 ? backButton : undefined} />
		{#if ready}
			<PageStack entries={navigation.stack} key={(entry, index) => `${index}:${JSON.stringify(entry)}`} order={navigation.order}>
				{#snippet children(entry)}
					{#if entry.page === 'discover'}
						<Discover />
					{:else if entry.page === 'installed'}
						<Installed />
					{:else if entry.page === 'updates'}
						<Updates />
					{:else if entry.page === 'category' || entry.page === 'collection' || entry.page === 'extensions'}
						<Browse route={entry} />
					{:else if entry.page === 'search'}
						<Search query={entry.query} />
					{:else if entry.page === 'app'}
						<AppPage target={entry.target} name={entry.name} askFullAccess={entry.askFullAccess} reviewAccess={entry.reviewAccess} />
					{:else if entry.page === 'sources'}
						<Sources />
					{:else if entry.page === 'project'}
						<Project id={entry.id} tab={entry.tab} />
					{:else if entry.page === 'release'}
						<Release id={entry.id} release={entry.release} />
					{:else if entry.page === 'publisher'}
						<Publisher section={entry.section} />
					{/if}
				{/snippet}
			</PageStack>
		{/if}
	</main>
	<Toast
		toast={developer.notices.current}
		dismissible
		ondismiss={developer.notices.dismiss}
	/>
</GlassShell>

{#if opening.failed}
	<OpenFailedDialog failed={opening.failed} onclose={() => opening.dismiss()} />
{/if}

{#if approvals.asking}
	<ApprovalDialog asking={approvals.asking} />
{/if}

{#if account.open}
	<AccountDialog />
{:else if account.notices.lost.length || account.notices.ended}
	<AccessNotice />
{/if}
