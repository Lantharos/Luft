<script lang="ts">
	import { onMount } from 'svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { appearance, GlassShell, IconButton, WindowControls } from '@luft/ui';
	import Sidebar from '#lib/components/Sidebar.svelte';
	import AppPage from '#lib/pages/app/AppPage.svelte';
	import Browse from '#lib/pages/browse/Browse.svelte';
	import Discover from '#lib/pages/discover/Discover.svelte';
	import OpenFile from '#lib/pages/file/OpenFile.svelte';
	import Installed from '#lib/pages/installed/Installed.svelte';
	import Search from '#lib/pages/search/Search.svelte';
	import Sources from '#lib/pages/sources/Sources.svelte';
	import Updates from '#lib/pages/updates/Updates.svelte';
	import { start } from '#lib/state/app.js';
	import { navigation } from '#lib/state/navigation.svelte.js';
	import { title } from '#lib/state/titles.js';

	let ready = $state(false);

	const route = $derived(navigation.route);
	const depth = $derived(navigation.stack.length);
	const heading = $derived(route.page !== 'app' ? title(route) : depth > 1 ? title(navigation.stack[depth - 2]) : '');

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

<svelte:window onkeydown={keys} />

<GlassShell>
	<Sidebar />
	<main class="glass-content">
		<header class="drag-region flex h-[60px] flex-none items-center gap-3 pr-4 pl-6">
			{#if depth > 1}
				<IconButton icon={ChevronLeft} label="Back" large onclick={() => navigation.back()} />
			{/if}
			<h1 class="min-w-0 flex-1 truncate pl-2 text-[20px] font-semibold">{heading}</h1>
			<WindowControls />
		</header>
		<div class="min-h-0 flex-1">
			{#if ready}
				{#each navigation.stack as entry, index (`${index}:${JSON.stringify(entry)}`)}
					<div class="h-full" hidden={index !== depth - 1}>
						{#if entry.page === 'discover'}
							<Discover />
						{:else if entry.page === 'installed'}
							<Installed />
						{:else if entry.page === 'updates'}
							<Updates />
						{:else if entry.page === 'category' || entry.page === 'collection'}
							<Browse route={entry} />
						{:else if entry.page === 'search'}
							<Search query={entry.query} />
						{:else if entry.page === 'app'}
							<AppPage target={entry.target} name={entry.name} askFullAccess={entry.askFullAccess} />
						{:else if entry.page === 'file'}
							<OpenFile path={entry.path} />
						{:else if entry.page === 'sources'}
							<Sources />
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</main>
</GlassShell>
