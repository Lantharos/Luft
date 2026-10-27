<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Row, Section } from '@luft/ui';
	import type { Permissions } from '#lib/bindings.js';
	import { describe } from '#lib/app/permissions.js';

	let { permissions, children }: { permissions: Permissions | null; children?: Snippet } = $props();
	const access = $derived(permissions ? describe(permissions) : []);
</script>

<Section title="What it can access">
	{#each access as entry (entry.title)}
		<Row title={entry.title} description={entry.description} icon={entry.icon} />
	{/each}
	{@render children?.()}
</Section>
