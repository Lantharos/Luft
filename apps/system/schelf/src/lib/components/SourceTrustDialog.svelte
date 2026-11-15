<script lang="ts">
	import { t } from '@luft/i18n';
	import type { CheckedSource } from '#lib/bindings.js';
	import SourceDetails from './SourceDetails.svelte';
	import ConsentDialog from './ConsentDialog.svelte';

	let { source, confirm = t('source-trust-add'), onconfirm, onclose }: { source: CheckedSource; confirm?: string; onconfirm: () => void; onclose: () => void } = $props();

	const name = $derived(source.described.sources[0]?.name ?? source.described.file);
</script>

<ConsentDialog
	title={t('source-trust-title', { name })}
	description={t('source-trust-description')}
	{confirm}
	danger
	{onconfirm}
	{onclose}
>
	<SourceDetails {source} />
</ConsentDialog>
