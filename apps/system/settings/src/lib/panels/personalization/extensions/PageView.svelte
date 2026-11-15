<script lang="ts">
	import { Section } from '@luft/ui';
	import type { Extension, PageSection } from '#lib/bindings.js';
	import { shownSections } from './extensions.svelte';
	import PageItem from './PageItem.svelte';

	let { extension, sections }: { extension: Extension; sections: PageSection[] } = $props();

	let shownOnes = $derived(shownSections(extension, sections));
</script>

{#each shownOnes as section, index (index)}
	<Section title={section.title ?? undefined} description={section.description ?? undefined}>
		{#each section.items as item, number (number)}
			<PageItem {extension} {item} />
		{/each}
	</Section>
{/each}
