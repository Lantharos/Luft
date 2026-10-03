<script lang="ts">
	import { Segmented } from '@luft/ui';
	import type { Permissions } from '#lib/bridge/types.js';
	import AccessList from '#lib/components/AccessList.svelte';
	import AppArt from '#lib/components/AppArt.svelte';
	import Description from '#lib/components/Description.svelte';
	import Screenshots from '#lib/components/Screenshots.svelte';
	import { backend } from '#lib/state/backend.js';
	import { navigation, type AppTarget } from '#lib/state/navigation.svelte.js';
	import AppActions from './AppActions.svelte';
	import AppFacts from './AppFacts.svelte';
	import { installedFor, load, type Listing, type Loaded } from './load';

	let { target, name }: { target: AppTarget; name: string } = $props();

	let loaded = $state<Loaded | null>(null);
	let localPermissions = $state<Permissions | null>(null);

	const details = $derived(loaded?.details ?? null);
	const installed = $derived(installedFor(target, details));
	const permissions = $derived(localPermissions ?? details?.permissions ?? null);
	const title = $derived(details?.name ?? installed?.name ?? name);
	const summary = $derived(details?.summary ?? installed?.summary ?? '');

	$effect(() => {
		const current = target;
		loaded = null;
		void load(current).then((result) => {
			if (target === current) loaded = result;
		});
	});

	$effect(() => {
		const app = installed;
		localPermissions = null;
		if (app?.source !== 'flatpak' || !app.installation || !app.reference) return;
		void backend()
			.permissions(app.installation, app.reference)
			.then((result) => (localPermissions = result))
			.catch(() => {});
	});

	function switchTo(listing: Listing) {
		navigation.replace({ page: 'app', target: listing, name: title });
	}

	const LABELS = { flathub: 'Flathub', fedora: 'Fedora' };
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[880px] flex-col gap-7 px-8 pt-2 pb-10">
		<header class="flex items-center gap-5">
			<AppArt icon={details?.icon ?? installed?.icon ?? null} desktop={installed?.desktop} size={88} />
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<h2 class="truncate text-[26px] font-semibold">{title}</h2>
				{#if details?.developer}
					<span class="truncate text-[13px] text-[var(--text-muted)]">{details.developer}</span>
				{/if}
				{#if summary}
					<p class="text-[14px] text-[var(--text-soft)]">{summary}</p>
				{/if}
			</div>
			<AppActions name={title} listing={loaded?.listing ?? null} packageName={details?.package ?? null} {installed} />
		</header>

		{#if loaded && loaded.alternatives.length > 1 && loaded.listing}
			{@const listing = loaded.listing}
			<div class="flex items-center justify-between gap-4">
				<span class="text-[13px] text-[var(--text-muted)]">Also available from another source</span>
				<Segmented
					label="Source"
					value={listing.origin}
					options={loaded.alternatives.map((option) => ({ value: option.origin, label: LABELS[option.origin] }))}
					onchange={(origin) => switchTo(loaded!.alternatives.find((option) => option.origin === origin)!)}
				/>
			</div>
		{/if}

		{#if !loaded}
			<div class="flex flex-col gap-3" aria-busy="true">
				<div class="skeleton h-[260px] w-full"></div>
				<div class="skeleton h-4 w-3/4"></div>
				<div class="skeleton h-4 w-2/3"></div>
			</div>
		{:else}
			{#if details?.screenshots.length}
				<Screenshots screenshots={details.screenshots} />
			{/if}
			{#if details?.description}
				<Description html={details.description} />
			{:else if loaded.error && !installed}
				<p class="text-[14px] text-[var(--text-muted)]">{loaded.error}</p>
			{/if}
			{#if details?.release?.notes}
				<section class="flex flex-col gap-2">
					<h3 class="text-[15px] font-semibold">What's new in {details.release.version}</h3>
					<Description html={details.release.notes} />
				</section>
			{/if}
			<AppFacts {details} {installed} />
			{#if permissions}
				<AccessList {permissions} />
			{/if}
		{/if}
	</div>
</div>
