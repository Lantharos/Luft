<script lang="ts">
	import type { CheckedSource } from '#lib/bridge/types.js';
	import SourceDetails from './SourceDetails.svelte';
	import TrustDialog from './TrustDialog.svelte';

	let { source, confirm = 'Add source', onconfirm, onclose }: { source: CheckedSource; confirm?: string; onconfirm: () => void; onclose: () => void } = $props();

	const name = $derived(source.described.sources[0]?.name ?? source.described.file);
</script>

<TrustDialog
	title="Trust {name}?"
	description="Packages from {name} install for everyone on this computer and can run as administrator while they install. They update with Luft from then on, so whoever runs this source can change software on this computer. Only add sources you trust."
	{confirm}
	{onconfirm}
	{onclose}
>
	<SourceDetails {source} />
</TrustDialog>
