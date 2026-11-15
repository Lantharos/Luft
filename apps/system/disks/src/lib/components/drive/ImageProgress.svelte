<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes, Row, Section } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { ImageProgress } from '#lib/bindings.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		progress: ImageProgress;
	}

	let { progress }: Props = $props();

	let share = $derived(progress.total > 0 ? Math.min(1, progress.copied / progress.total) : 0);
	let title = $derived(
		t('disks-image-progress', { direction: progress.restoring ? 'writing' : 'saving', finished: progress.finished ? 'yes' : 'no' })
	);
	let description = $derived(
		progress.finished
			? t('disks-image-copied', { size: bytes(progress.copied) })
			: progress.rate > 0
				? t('disks-image-progress-rate', { copied: bytes(progress.copied), total: bytes(progress.total), rate: bytes(progress.rate) })
				: t('disks-image-progress-total', { copied: bytes(progress.copied), total: bytes(progress.total) })
	);
</script>

<Section>
	<Row {title} {description}>
		{#if progress.finished}
			<button type="button" class="button" onclick={() => (disks.image = null)}>{t('disks-done')}</button>
		{:else}
			<button type="button" class="button" onclick={() => commands.disksImageCancel()}>{t('disks-cancel')}</button>
		{/if}
		{#snippet below()}
			<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
				<div class="h-full origin-left rounded-full bg-[var(--accent)] transition-transform" style:transform="scaleX({progress.finished ? 1 : share})"></div>
			</div>
		{/snippet}
	</Row>
</Section>
