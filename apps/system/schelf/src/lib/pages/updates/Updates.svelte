<script lang="ts">
	import { i18n, t } from '@luft/i18n';
	import Layers from '@lucide/svelte/icons/layers';
	import { ago, bytes, Row, Section, Spinner } from '@luft/ui';
	import type { AppUpdate, Job } from '#lib/bindings.js';
	import { updateJob } from '#lib/app/jobs.js';
	import { library } from '#lib/state/library.svelte.js';
	import { operations } from '#lib/state/operations.svelte.js';
	import UpdateRow from './UpdateRow.svelte';

	const updates = $derived(library.updates?.apps ?? []);
	const apps = $derived(updates.filter((update) => !update.platform && update.source !== 'tool'));
	const tools = $derived(updates.filter((update) => update.source === 'tool'));
	const platforms = $derived(updates.filter((update) => update.platform));
	const waiting = $derived(updates.filter((update) => !operations.forKey(update.key) || operations.forKey(update.key)?.state === 'failed'));
	const failed = $derived(library.updates?.failed ?? []);
	const sabine = $derived(library.updates?.sabine ?? null);
	const size = $derived(updates.reduce((sum, update) => sum + update.size, 0));

	const headline = $derived.by(() => {
		if (!library.updates) return t(library.checking ? 'updates-checking' : 'updates-title');
		if (!updates.length) return t(failed.length ? 'updates-none-found' : 'updates-up-to-date');
		return t('updates-available', { count: updates.length });
	});

	function batch(key: string, list: AppUpdate[], job: Job) {
		if (list.length === 1) void operations.run(list[0].key, list[0].name, updateJob(list[0]));
		else if (list.length) void operations.run(key, t('updates-batch', { count: list.length }), job, list.map((update) => update.key));
	}

	function updateAll() {
		for (const installation of ['user', 'system'] as const) {
			const list = waiting.filter((update) => update.source === 'flatpak' && update.installation === installation);
			batch(`flatpak-updates/${installation}`, list, { kind: 'updateFlatpaks', installation, references: list.map((update) => update.reference!) });
		}
		const tools = waiting.filter((update) => update.source === 'tool');
		batch('tool-updates', tools, { kind: 'updateTools', packages: tools.map((update) => update.package!) });
		const debs = waiting.filter((update) => update.source === 'debian');
		batch('deb-updates', debs, { kind: 'updateDebs', packages: debs.map((update) => update.package!) });
		for (const update of waiting.filter((update) => (update.source === 'appImage' || update.source === 'storeTool' || update.store) && !update.store?.widens)) void operations.run(update.key, update.name, updateJob(update));
	}
</script>

<div class="soft-scroll h-full overflow-y-auto">
	<div class="mx-auto flex w-full max-w-[760px] flex-col gap-7 px-8 pt-2 pb-10">
		<div class="flex items-center gap-4 px-2">
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<span class="text-[22px] font-semibold">{headline}</span>
				<span class="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
					{#if library.error}
						{library.error}
					{:else if library.checking}
						<Spinner size={13} />
						{t('updates-looking')}
					{:else if library.updates}
						{updates.length ? t('updates-checked-size', { size: bytes(size), when: ago(library.updates.checked) }) : t('updates-checked', { when: ago(library.updates.checked) })}
					{/if}
				</span>
				{#if !library.checking}
					{#each failed as failure (failure)}
						<span class="text-[13px] text-[var(--text-muted)]">{failure}</span>
					{/each}
				{/if}
			</div>
			<button type="button" class="button" disabled={library.checking} onclick={() => library.check()}>{t('updates-check-now')}</button>
			{#if waiting.length > 1}
				<button type="button" class="button primary" onclick={updateAll}>{t('updates-update-all')}</button>
			{/if}
		</div>

		{#if apps.length}
			<Section title={t('updates-apps')}>
				{#each apps as update (update.key)}
					<UpdateRow {update} />
				{/each}
			</Section>
		{/if}

		{#if tools.length}
			<Section title={t('updates-tools')}>
				{#each tools as update (update.key)}
					<UpdateRow {update} />
				{/each}
			</Section>
		{/if}

		{#if platforms.length}
			<Section title={t('updates-platforms')} description={t('updates-platforms-description')}>
				{#each platforms as update (update.key)}
					<UpdateRow {update} />
				{/each}
			</Section>
		{/if}

		{#if sabine}
			<Section>
				<Row
					icon={Layers}
					title={t('updates-sabine-waiting', { version: sabine.version })}
					description={t('updates-sabine-waiting-for', { apps: new Intl.ListFormat(i18n.formats, { type: 'conjunction' }).format(sabine.apps) })}
				/>
			</Section>
		{/if}
	</div>
</div>
