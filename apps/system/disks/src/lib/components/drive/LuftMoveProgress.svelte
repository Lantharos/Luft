<script lang="ts">
	import { t } from '@luft/i18n';
	import { ProgressBar, Row, Section } from '@luft/ui';
	import type { Protection } from '#lib/bindings.js';

	interface Props {
		protection: Protection;
	}

	let { protection }: Props = $props();

	let stage = $derived(protection.systemResize);
	let title = $derived(t('disks-luft-move', { stage }));
	let fraction = $derived(stage === 'finishing' ? null : protection.resizeProgress);
</script>

<Section>
	<Row {title} description={stage === 'paused' ? '' : t('disks-luft-move-meanwhile')}>
		{#snippet below()}
			{#if stage !== 'paused'}
				<ProgressBar {fraction} label={title} />
			{/if}
		{/snippet}
	</Row>
</Section>
