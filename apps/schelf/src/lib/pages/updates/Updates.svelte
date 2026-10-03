<script lang="ts">
	import { Section } from '@luft/ui';
	import type { AppUpdate, Job } from '#lib/bridge/types.js';
	import { updateJob } from '#lib/app/jobs.js';
	import { ago, bytes } from '#lib/format.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import UpdateRow from './UpdateRow.svelte';

	const updates = $derived(library.updates?.apps ?? []);
	const apps = $derived(updates.filter((update) => !update.platform));
	const platforms = $derived(updates.filter((update) => update.platform));
	const waiting = $derived(updates.filter((update) => !operations.forKey(update.key) || operations.forKey(update.key)?.state === 'failed'));
	const size = $derived(updates.reduce((sum, update) => sum + update.size, 0));

	const headline = $derived.by(() => {
		if (!library.updates) return library.checking ? 'Checking for updates…' : 'Updates';
		if (!updates.length) return 'Your apps are up to date';
		return `${updates.length} ${updates.length === 1 ? 'update' : 'updates'} available`;
	});

	function batch(key: string, list: AppUpdate[], job: Job) {
		if (list.length === 1) void operations.run(list[0].key, list[0].name, updateJob(list[0]));
		else if (list.length) void operations.run(key, `${list.length} apps`, job, list.map((update) => update.key));
	}

	function updateAll() {
		for (const installation of ['user', 'system'] as const) {
			const list = waiting.filter((update) => update.source === 'flatpak' && update.installation === installation);
			batch(`flatpak-updates/${installation}`, list, { kind: 'updateFlatpaks', installation, references: list.map((update) => update.reference!) });
		}
		const packages = waiting.filter((update) => update.source === 'package');
		batch('package-updates', packages, { kind: 'updatePackages', packages: packages.map((update) => update.package!) });
		for (const update of waiting.filter((update) => update.source === 'appImage')) void operations.run(update.key, update.name, updateJob(update));
	}
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
		<div class="flex items-center gap-4 px-2">
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="text-[22px] font-semibold">{headline}</span>
				<span class="text-[13px] text-[var(--text-muted)]">
					{#if library.error}
						{library.error}
					{:else if library.checking}
						Looking at Flathub, your software sources and your AppImages
					{:else if library.updates}
						{updates.length ? `${bytes(size)} to download · ` : ''}Checked {ago(library.updates.checked)}
					{/if}
				</span>
			</div>
			<button type="button" class="button" disabled={library.checking} onclick={() => library.check()}>Check now</button>
			{#if waiting.length > 1}
				<button type="button" class="button primary" onclick={updateAll}>Update all</button>
			{/if}
		</div>

		{#if apps.length}
			<Section title="Apps">
				{#each apps as update (update.key)}
					<UpdateRow {update} />
				{/each}
			</Section>
		{/if}

		{#if platforms.length}
			<Section title="App platforms" description="Shared parts that Flatpak apps are built on">
				{#each platforms as update (update.key)}
					<UpdateRow {update} />
				{/each}
			</Section>
		{/if}
	</div>
</div>
