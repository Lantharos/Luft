<script lang="ts">
	import { Section } from '@luft/ui';
	import { extensions } from './extensions.svelte';
	import SettingRow from './SettingRow.svelte';

	let { page }: { page: string } = $props();

	void extensions.load();

	let contributions = $derived(extensions.onPage(page));
</script>

{#each contributions as { extension, settings } (extension.id)}
	<Section title={extension.name}>
		{#each settings as setting (setting.key)}
			<SettingRow {extension} {setting} />
		{/each}
	</Section>
{/each}
