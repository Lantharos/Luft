<script lang="ts">
	import { bytes, Row } from '@luft/ui';
	import ProgressTrack from '#lib/components/ProgressTrack.svelte';
	import { cancelInstall, install, remove, type Model } from './api';

	let { model, removable = false }: { model: Model; removable?: boolean } = $props();

	let download = $derived(model.download);
	let downloading = $derived(!!download && !download.problem);

	function describe() {
		if (download?.problem) return `Couldn’t download: ${download.problem}`;
		if (download) return `${bytes(download.received)} of ${bytes(download.total)}`;
		if (model.installed) return `${bytes(model.usage)} on this computer`;
		if (model.usage > 0) return `${bytes(model.usage)} of ${bytes(model.size)} downloaded`;
		return `${bytes(model.size)} to download`;
	}
</script>

{#snippet progress()}
	<ProgressTrack fraction={download?.total ? download.received / download.total : null} class="h-1.5 bg-[var(--control)]" />
{/snippet}

<Row title={model.name} description={describe()} below={downloading ? progress : undefined}>
	{#if download}
		{#if download.problem}
			<button type="button" class="button" onclick={() => install(model.id)}>Try again</button>
		{/if}
		<button type="button" class="button" onclick={() => cancelInstall(model.id)}>Cancel</button>
	{:else}
		{#if !model.installed}
			<button type="button" class="button" onclick={() => install(model.id)}>{model.usage > 0 ? 'Resume' : 'Download'}</button>
		{/if}
		{#if removable}
			<button type="button" class="button" onclick={() => remove(model.id)}>Remove</button>
		{/if}
	{/if}
</Row>
