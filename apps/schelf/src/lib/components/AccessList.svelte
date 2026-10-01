<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import type { Permissions } from '$lib/bridge/types';
	import { describe } from '$lib/app/permissions';

	let { permissions }: { permissions: Permissions } = $props();
	const access = $derived(describe(permissions));
</script>

<Section title="What it can access">
	{#each access as entry (entry.title)}
		<Row title={entry.title} description={entry.description} icon={entry.icon} />
	{/each}
</Section>
