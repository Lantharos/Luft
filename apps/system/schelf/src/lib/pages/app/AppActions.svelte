<script lang="ts">
	import { t } from '@luft/i18n';
	import type { CatalogApp, InstalledApp, Job, Permissions, StoreDetails } from '#lib/bindings.js';
	import type { Access } from '#lib/app/permissions.js';
	import { broadAccess } from '#lib/catalog/flathub.js';
	import FlathubConsent from '#lib/components/FlathubConsent.svelte';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { openUrl } from '#lib/bridge/index.js';
	import { opening } from '#lib/state/opening.svelte.js';
	import { transferred } from '#lib/format.js';
	import { catalogKey } from '#lib/catalog/types.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import { storeJob, updateJob } from '#lib/app/jobs.js';
	import { sandboxLacks } from '#lib/app/extensionAccess.js';
	import StoreConsent from './StoreConsent.svelte';

	interface Props {
		name: string;
		listing: CatalogApp | null;
		store: StoreDetails | null;
		installed: InstalledApp | null;
		permissions: Permissions | null;
		pulled: boolean;
	}

	let { name, listing, store, installed, permissions, pulled }: Props = $props();

	let removing = $state(false);
	let consenting = $state<'install' | 'update' | null>(null);
	let flathubAccess = $state<Access[] | null>(null);

	const listingKey = $derived(listing?.origin === 'fedora' ? `system/${listing.package ?? listing.id}` : listing ? catalogKey(listing) : null);
	const operation = $derived((installed && operations.forKey(installed.key)) || (listingKey && operations.forKey(listingKey)) || null);
	const active = $derived(operation && operation.state !== 'failed' ? operation : null);
	const update = $derived(installed ? library.update(installed.key) : null);

	function run(key: string, job: Job) {
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		void operations.run(key, name, job);
	}

	function agreed(fullAccess: boolean) {
		const job = store && storeJob(store, fullAccess, consenting === 'update');
		const key = consenting === 'update' ? installed?.key : listingKey;
		consenting = null;
		if (job && key) run(key, job);
	}

	function installFlathub() {
		flathubAccess = null;
		if (listing && listingKey) run(listingKey, { kind: 'installFlathub', id: listing.id });
	}

	async function install() {
		if (!listing || !listingKey) return;
		if (listing.origin === 'schelf') consenting = 'install';
		else if (listing.origin === 'flathub') {
			const access = await broadAccess(listing.id, permissions);
			if (access.length) flathubAccess = access;
			else installFlathub();
		} else run(listingKey, { kind: 'installSystemPackages', packages: [listing.package ?? listing.id] });
	}

	function updateNow() {
		if (!installed || !update) return;
		if (update.store?.widens) consenting = 'update';
		else run(installed.key, updateJob(update));
	}
</script>

<div class="flex flex-col items-end gap-2">
	<div class="flex items-center gap-2">
		{#if active}
			<ProgressButton operation={active} large />
		{:else if installed}
			<button type="button" class="button large" onclick={() => (removing = true)}>{t('app-remove')}</button>
			{#if update && !pulled}
				<button type="button" class="button large" onclick={updateNow}>{t('app-update')}</button>
			{/if}
			{#if installed.desktop && !pulled}
				<button type="button" class="button primary large" onclick={() => opening.open(installed)}>{t('app-open')}</button>
			{/if}
		{:else if listing && (listing.origin !== 'schelf' || store?.installer)}
			<button type="button" class="button primary large" onclick={install}>{t('app-install')}</button>
		{:else if store?.needsLuft}
			<p class="max-w-[320px] text-right text-[13px] text-[var(--text-muted)]">{t('app-needs-luft', { version: store.needsLuft })}</p>
		{:else if store?.needsReview.length}
			<p class="max-w-[320px] text-right text-[13px] text-[var(--text-muted)]">{t('app-needs-review', { needs: sandboxLacks(store.needsReview) })}</p>
		{:else if store?.download}
			{@const file = store.download}
			<button type="button" class="button large" title={file.name} onclick={() => openUrl(file.url)}>{t('app-download')}</button>
		{/if}
	</div>
	{#if installed && store?.needsLuft && !active}
		<p class="max-w-[320px] text-right text-[12.5px] text-[var(--text-muted)]">{t('app-newest-needs-luft', { version: store.needsLuft })}</p>
	{:else if store?.luft && !active}
		<p class="max-w-[320px] text-right text-[12.5px] text-[var(--text-muted)]">{t('app-runs-on-luft', { version: store.luft })}</p>
	{/if}
	{#if active && transferred(active)}
		<p class="text-[12.5px] text-[var(--text-muted)] tabular-nums">{transferred(active)}</p>
	{:else if operation?.state === 'failed'}
		<p class="max-w-[320px] text-right text-[12.5px] text-[var(--danger)]">{operation.error}</p>
	{/if}
</div>

{#if removing && installed}
	<RemoveDialog app={installed} onclose={() => (removing = false)} />
{/if}

{#if consenting && store}
	<StoreConsent {store} updating={consenting === 'update'} movesInside={consenting === 'update' && !!update?.store?.movesInside} onconfirm={agreed} onclose={() => (consenting = null)} />
{/if}

{#if flathubAccess}
	<FlathubConsent {name} access={flathubAccess} onconfirm={installFlathub} onclose={() => (flathubAccess = null)} />
{/if}
