<script lang="ts">
	import { Section } from '@luft/ui';
	import type { Extension } from '#lib/bindings.js';
	import { extensions } from './extensions.svelte';
	import PageItem from './PageItem.svelte';

	let { extension }: { extension: Extension } = $props();

	$effect(() => extensions.showPage(extension.id));

	let sections = $derived(extensions.pages[extension.id] ?? []);
</script>

{#each sections as section, index (index)}
	<Section title={section.title ?? undefined} description={section.description ?? undefined}>
		{#each section.items as item, number (number)}
			<PageItem {extension} {item} />
		{/each}
	</Section>
{/each}
