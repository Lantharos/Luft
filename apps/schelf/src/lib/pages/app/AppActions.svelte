<script lang="ts">
	import type { CatalogApp, InstalledApp, Job, StoreDetails } from '#lib/bindings.js';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { launch, openUrl } from '#lib/bridge/index.js';
	import { catalogKey } from '#lib/catalog/types.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import { updateJob } from '#lib/app/jobs.js';
	import ConsentDialog from './ConsentDialog.svelte';

	interface Props {
		name: string;
		listing: CatalogApp | null;
		store: StoreDetails | null;
		installed: InstalledApp | null;
		pulled: boolean;
	}

	let { name, listing, store, installed, pulled }: Props = $props();

	let removing = $state(false);
	let consenting = $state<'install' | 'update' | null>(null);

	const listingKey = $derived(listing?.origin === 'fedora' ? `system/${listing.package ?? listing.id}` : listing ? catalogKey(listing) : null);
	const operation = $derived((installed && operations.forKey(installed.key)) || (listingKey && operations.forKey(listingKey)) || null);
	const active = $derived(operation && operation.state !== 'failed' ? operation : null);
	const update = $derived(installed ? library.update(installed.key) : null);

	function run(key: string, job: Job) {
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		void operations.run(key, name, job);
	}

	function storeJob(fullAccess: boolean): Job | null {
		if (!store?.installer || !store.version) return null;
		const consent = { version: store.version, permissions: store.declared, extension: store.extension, fullAccess };
		return consenting === 'update' ? { kind: 'updateStore', id: store.id, consent } : { kind: 'installStore', id: store.id, consent };
	}

	function agreed(fullAccess: boolean) {
		const job = storeJob(fullAccess);
		const key = consenting === 'update' ? installed?.key : listingKey;
		consenting = null;
		if (job && key) run(key, job);
	}

	function install() {
		if (!listing || !listingKey) return;
		if (listing.origin === 'schelf') consenting = 'install';
		else if (listing.origin === 'flathub') run(listingKey, { kind: 'installFlathub', id: listing.id });
		else run(listingKey, { kind: 'installSystemPackages', packages: [listing.package ?? listing.id] });
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
			<button type="button" class="button large" onclick={() => (removing = true)}>Remove</button>
			{#if update && !pulled}
				<button type="button" class="button large" onclick={updateNow}>Update</button>
			{/if}
			{#if installed.desktop && !pulled}
				<button type="button" class="button primary large" onclick={() => launch(installed.desktop!)}>Open</button>
			{/if}
		{:else if listing && (listing.origin !== 'schelf' || store?.installer)}
			<button type="button" class="button primary large" onclick={install}>Install</button>
		{:else if store?.download}
			{@const file = store.download}
			<button type="button" class="button large" title={file.name} onclick={() => openUrl(file.url)}>Download</button>
		{/if}
	</div>
	{#if operation?.state === 'failed'}
		<p class="max-w-[320px] text-right text-[12.5px] text-[var(--danger)]">{operation.error}</p>
	{/if}
</div>

{#if removing && installed}
	<RemoveDialog app={installed} onclose={() => (removing = false)} />
{/if}

{#if consenting && store}
	<ConsentDialog {store} updating={consenting === 'update'} onconfirm={agreed} onclose={() => (consenting = null)} />
{/if}
