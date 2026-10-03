<script lang="ts">
	import type { InstalledApp, Job } from '#lib/bridge/types.js';
	import ProgressButton from '#lib/components/ProgressButton.svelte';
	import RemoveDialog from '#lib/components/RemoveDialog.svelte';
	import { backend } from '#lib/state/backend.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import { updateJob } from '#lib/app/jobs.js';
	import type { Listing } from './load';

	interface Props {
		name: string;
		listing: Listing | null;
		packageName: string | null;
		installed: InstalledApp | null;
	}

	let { name, listing, packageName, installed }: Props = $props();

	let confirming = $state(false);

	const listingKey = $derived(listing ? `${listing.origin}:${listing.id}` : null);
	const operation = $derived((installed && operations.forKey(installed.key)) || (listingKey && operations.forKey(listingKey)) || null);
	const active = $derived(operation && operation.state !== 'failed' ? operation : null);
	const update = $derived(installed ? library.update(installed.key) : null);

	function run(key: string, job: Job) {
		if (operation?.state === 'failed') void operations.cancel(operation.id);
		void operations.run(key, name, job);
	}

	function install() {
		if (!listing || !listingKey) return;
		if (listing.origin === 'flathub') run(listingKey, { kind: 'installFlathub', id: listing.id });
		else if (packageName) run(listingKey, { kind: 'installPackage', package: packageName });
	}

	function updateNow() {
		if (!installed || !update) return;
		run(installed.key, updateJob(update));
	}
</script>

<div class="flex flex-col items-end gap-2">
	<div class="flex items-center gap-2">
		{#if active}
			<ProgressButton operation={active} large />
		{:else if installed}
			<button type="button" class="button large" onclick={() => (confirming = true)}>Remove</button>
			{#if update}
				<button type="button" class="button large" onclick={updateNow}>Update</button>
			{/if}
			{#if installed.desktop}
				<button type="button" class="button primary large" onclick={() => backend().launch(installed.desktop!)}>Open</button>
			{/if}
		{:else if listing}
			<button type="button" class="button primary large" onclick={install}>Install</button>
		{/if}
	</div>
	{#if operation?.state === 'failed'}
		<p class="max-w-[320px] text-right text-[12.5px] text-[var(--danger)]">{operation.error}</p>
	{/if}
</div>

{#if confirming && installed}
	<RemoveDialog app={installed} onclose={() => (confirming = false)} />
{/if}
