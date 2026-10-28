<script lang="ts">
	import { commands, type Permissions } from '#lib/bindings.js';
	import AccessList from '#lib/components/AccessList.svelte';
	import AppArt from '#lib/components/AppArt.svelte';
	import Description from '#lib/components/Description.svelte';
	import Screenshots from '#lib/components/Screenshots.svelte';
	import type { AppTarget } from '#lib/state/navigation.svelte.js';
	import AppActions from './AppActions.svelte';
	import AppFacts from './AppFacts.svelte';
	import FullAccess from './FullAccess.svelte';
	import { installedFor, load, type Loaded } from './load';

	let { target, name, askFullAccess = false }: { target: AppTarget; name: string; askFullAccess?: boolean } = $props();

	let loaded = $state<Loaded | null>(null);
	let localPermissions = $state<Permissions | null>(null);
	let unsandboxedReason = $state<string | null>(null);
	let fullAccess = $state(false);
	let asking = $state(false);

	const details = $derived(loaded?.details ?? null);
	const installed = $derived(installedFor(target));
	const permissions = $derived(localPermissions ?? details?.permissions ?? null);
	const title = $derived(details?.name ?? installed?.name ?? name);
	const summary = $derived(details?.summary ?? installed?.summary ?? '');
	const sandboxed = $derived(installed?.source === 'appImage' || installed?.source === 'flatpak' ? installed : null);

	$effect(() => {
		asking = askFullAccess;
	});

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
		unsandboxedReason = null;
		if (app?.source === 'appImage') {
			void commands
				.librarySandbox({ id: app.id })
				.then((result) => {
					if (installed?.id !== app.id) return;
					localPermissions = result.permissions;
					unsandboxedReason = result.unsandboxed;
				})
				.catch(() => {});
			return;
		}
		if (app?.source !== 'flatpak' || !app.installation || !app.reference) return;
		void commands
			.libraryPermissions({ installation: app.installation, reference: app.reference })
			.then((result) => (localPermissions = result))
			.catch(() => {});
	});
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[880px] flex-col gap-7 px-8 pt-2 pb-10">
		<header class="flex items-center gap-5">
			<AppArt icon={details?.icon ?? installed?.icon ?? null} desktop={installed?.desktop} source={installed?.source} size={88} />
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<h2 class="truncate text-[26px] font-semibold">{title}</h2>
				{#if details?.developer}
					<span class="truncate text-[13px] text-[var(--text-muted)]">{details.developer}</span>
				{/if}
				{#if summary}
					<p class="text-[14px] text-[var(--text-soft)]">{summary}</p>
				{/if}
			</div>
			<AppActions name={title} listing={loaded?.listing ?? null} {installed} />
		</header>

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
			{#if sandboxed}
				<AccessList permissions={fullAccess ? null : permissions}>
					<FullAccess app={sandboxed} reason={unsandboxedReason} bind:on={fullAccess} bind:asking />
				</AccessList>
			{:else if permissions}
				<AccessList {permissions} />
			{/if}
		{/if}
	</div>
</div>
