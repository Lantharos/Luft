<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import type { Provenance } from '#lib/bindings.js';
	import { openUrl } from '#lib/bridge/index.js';

	let { provenance }: { provenance: Provenance } = $props();

	const built = $derived(provenance.origin === 'github-actions');
	const where = $derived(
		[provenance.repository && `From ${provenance.repository}`, provenance.commit && `at ${provenance.commit.slice(0, 7)}`].filter(Boolean).join(' ')
	);
</script>

<Section title="Where it comes from">
	{#if built}
		<Row
			title="Built on GitHub Actions"
			description="{where ? `${where}, by` : 'By'} the workflow its developer set up. schelf.store checked it before it reached you."
		>
			{#if provenance.run}
				{@const run = provenance.run}
				<button type="button" class="button" onclick={() => openUrl(run)}>See the build</button>
			{/if}
		</Row>
	{:else}
		<Row title="Uploaded by the developer" description="It wasn't built in public, so only the developer knows how it was made. schelf.store checked it before it reached you." />
	{/if}
	{#if provenance.repository}
		{@const repository = provenance.repository}
		<Row title="Source code" description={repository}>
			<button type="button" class="button" onclick={() => openUrl(`https://github.com/${repository}`)}>Visit</button>
		</Row>
	{/if}
</Section>
