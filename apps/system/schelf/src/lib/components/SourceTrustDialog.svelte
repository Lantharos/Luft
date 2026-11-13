<script lang="ts">
	import type { CheckedSource } from '#lib/bindings.js';
	import SourceDetails from './SourceDetails.svelte';
	import ConsentDialog from './ConsentDialog.svelte';

	let { source, confirm = 'Add source', onconfirm, onclose }: { source: CheckedSource; confirm?: string; onconfirm: () => void; onclose: () => void } = $props();

	const name = $derived(source.described.sources[0]?.name ?? source.described.file);
</script>

<ConsentDialog
	title="Trust {name}?"
	description="Whoever runs it can change software on this computer: its packages install for everyone and can run as administrator. Only add sources you trust."
	{confirm}
	danger
	{onconfirm}
	{onclose}
>
	<SourceDetails {source} />
</ConsentDialog>
