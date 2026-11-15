<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import type { Provenance } from '#lib/bindings.js';
	import { openUrl } from '#lib/bridge/index.js';

	let { provenance }: { provenance: Provenance } = $props();

	const built = $derived(provenance.origin === 'github-actions');
	const description = $derived.by(() => {
		const { repository, commit } = provenance;
		if (!repository) return t('app-provenance-built-description');
		if (!commit) return t('app-provenance-built-repository', { repository });
		return t('app-provenance-built-commit', { repository, commit: commit.slice(0, 7) });
	});
</script>

<Section title={t('app-provenance')}>
	{#if built}
		<Row title={t('app-provenance-built')} {description}>
			{#if provenance.run}
				{@const run = provenance.run}
				<button type="button" class="button" onclick={() => openUrl(run)}>{t('app-provenance-run')}</button>
			{/if}
		</Row>
	{:else}
		<Row title={t('app-provenance-uploaded')} description={t('app-provenance-uploaded-description')} />
	{/if}
	{#if provenance.repository}
		{@const repository = provenance.repository}
		<Row title={t('app-provenance-source')} description={repository}>
			<button type="button" class="button" onclick={() => openUrl(`https://github.com/${repository}`)}>{t('app-visit')}</button>
		</Row>
	{/if}
</Section>
