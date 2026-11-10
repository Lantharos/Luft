<script lang="ts">
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ShieldOff from '@lucide/svelte/icons/shield-off';
	import { Row, Section } from '@luft/ui';
	import { abilities } from '#lib/app/extensionAccess.js';
	import { commands, type Permissions } from '#lib/bindings.js';
	import AccessList from '#lib/components/AccessList.svelte';
	import AppArt from '#lib/components/AppArt.svelte';
	import Description from '#lib/components/Description.svelte';
	import ExtensionArt from '#lib/components/ExtensionArt.svelte';
	import Screenshots from '#lib/components/Screenshots.svelte';
	import { catalog } from '#lib/state/catalog.svelte.js';
	import type { AppTarget } from '#lib/state/navigation.svelte.js';
	import AppActions from './AppActions.svelte';
	import AppFacts from './AppFacts.svelte';
	import Channel from './Channel.svelte';
	import FullAccess from './FullAccess.svelte';
	import NameAndIcon from './NameAndIcon.svelte';
	import Notifications from './Notifications.svelte';
	import Provenance from './Provenance.svelte';
	import PulledNotice from './PulledNotice.svelte';
	import ReplacedNotice from './ReplacedNotice.svelte';
	import SandboxAccess from './SandboxAccess.svelte';
	import { installedFor, load, type Loaded } from './load';

	let { target, name, askFullAccess = false, reviewAccess = false }: { target: AppTarget; name: string; askFullAccess?: boolean; reviewAccess?: boolean } = $props();

	let loaded = $state<Loaded | null>(null);
	let localPermissions = $state<Permissions | null>(null);
	let unsandboxedReason = $state<string | null>(null);
	let fullAccess = $state(false);
	let asking = $state(false);
	let reviewing = $state(false);

	const details = $derived(loaded?.details ?? null);
	const installed = $derived(installedFor(target));
	const permissions = $derived(localPermissions ?? details?.permissions ?? null);
	const known = $derived('listing' in target ? target.listing : null);
	const title = $derived(details?.name ?? installed?.name ?? name);
	const summary = $derived(details?.summary ?? installed?.summary ?? known?.summary ?? '');
	const sandboxed = $derived(installed?.source === 'appImage' || installed?.source === 'flatpak' ? installed : null);
	const store = $derived(details?.store ?? null);
	const withdrawn = $derived(installed !== null && store?.withdrawn === true);
	const listing = $derived(loaded?.listing ?? known);
	const block = $derived(installed?.listing ? (catalog.installed(installed.listing)?.block ?? null) : null);
	const extension = $derived(store?.kind === 'extension' || installed?.source === 'extension' || known?.kind === 'extension');
	const icon = $derived(details?.icon ?? installed?.icon ?? known?.icon ?? null);
	const from = $derived(listing?.origin === 'flathub' ? 'From Flathub' : listing?.origin === 'fedora' ? 'From Fedora' : null);

	$effect(() => {
		asking = askFullAccess;
		reviewing = reviewAccess;
	});

	function readSandbox(id: string) {
		void commands
			.librarySandbox({ id })
			.then((result) => {
				if (installed?.id !== id) return;
				localPermissions = result.permissions;
				unsandboxedReason = result.unsandboxed;
			})
			.catch(() => {});
	}

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
			readSandbox(app.id);
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
			{#if extension}
				<ExtensionArt art={details?.screenshots[0]?.url ?? known?.art ?? null} {icon} height={88} />
			{:else}
				<AppArt {icon} desktop={installed?.desktop} source={installed?.source ?? null} size={88} />
			{/if}
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<h2 class="truncate text-[26px] font-semibold">{title}</h2>
				{#if details?.developer || from || withdrawn}
					{@const rest = [from, withdrawn && 'No longer available on Schelf'].filter(Boolean).join(' · ')}
					<span class="flex min-w-0 items-center gap-1 text-[13px] text-[var(--text-muted)]">
						{#if details?.developer}
							<span class="truncate">{details.developer}</span>
							{#if details.verified}
								<span class="flex-none text-[var(--accent)]" title={details.verified}><BadgeCheck size={14} aria-label={details.verified} /></span>
							{/if}
						{/if}
						{#if rest}<span class="truncate">{details?.developer ? `· ${rest}` : rest}</span>{/if}
					</span>
				{/if}
				{#if summary}
					<p class="text-[14px] text-[var(--text-soft)]">{summary}</p>
				{/if}
			</div>
			<AppActions name={title} {listing} {store} {installed} permissions={details?.permissions ?? null} pulled={block?.action === 'block'} />
		</header>

		{#if block && installed}
			<PulledNotice name={title} {block} app={installed} />
		{/if}

		{#if store?.replacedBy}
			<ReplacedNotice replacement={store.replacedBy} />
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
			{#if store && store.choices.length > 1}
				<Channel {store} installed={installed !== null} onchange={(details) => loaded && (loaded = { ...loaded, details })} />
			{/if}
			{#if installed?.desktop}
				<NameAndIcon desktop={installed.desktop} />
				<Notifications desktop={installed.desktop} />
			{/if}
			{#if sandboxed}
				<AccessList permissions={fullAccess ? null : permissions}>
					{#if sandboxed.source === 'appImage' && !fullAccess && localPermissions}
						<SandboxAccess app={sandboxed} permissions={localPermissions} bind:open={reviewing} onchange={() => readSandbox(sandboxed.id)} />
					{/if}
					<FullAccess app={sandboxed} reason={unsandboxedReason} bind:on={fullAccess} bind:asking />
				</AccessList>
			{:else if permissions}
				<AccessList {permissions} />
			{:else if store?.extension}
				<Section title="What it can do">
					{#each abilities(store.extension) as ability (ability.title)}
						<Row title={ability.title} icon={ability.icon} />
					{/each}
				</Section>
			{:else if store}
				<AccessList permissions={null}>
					<Row
						title="Full access"
						description={store.declared?.unsandboxed
							? `It asks to run outside a sandbox: “${store.declared.unsandboxed}”`
							: 'It runs outside a sandbox, with everything a program you start yourself can do.'}
						icon={ShieldOff}
					/>
				</AccessList>
			{/if}
			{#if store?.provenance}
				<Provenance provenance={store.provenance} />
			{/if}
		{/if}
	</div>
</div>
