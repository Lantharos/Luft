<script lang="ts">
	import { bytes, Row, Section } from '@luft/ui';
	import * as api from '#lib/api.js';
	import type { ImageProgress } from '#lib/api.js';
	import { disks } from '#lib/state/disks.svelte.js';

	interface Props {
		progress: ImageProgress;
	}

	let { progress }: Props = $props();

	let share = $derived(progress.total > 0 ? Math.min(1, progress.copied / progress.total) : 0);
	let title = $derived(
		progress.finished
			? progress.restoring
				? 'Disk image written'
				: 'Disk image saved'
			: progress.restoring
				? 'Writing disk image'
				: 'Saving disk image'
	);
	let description = $derived(
		progress.finished
			? `${bytes(progress.copied)} copied`
			: `${bytes(progress.copied)} of ${bytes(progress.total)}${progress.rate > 0 ? ` · ${bytes(progress.rate)}/s` : ''}`
	);
</script>

<Section>
	<Row {title} {description}>
		{#if progress.finished}
			<button type="button" class="button" onclick={() => (disks.image = null)}>Done</button>
		{:else}
			<button type="button" class="button" onclick={api.cancelImage}>Cancel</button>
		{/if}
		{#snippet below()}
			<div class="h-1.5 overflow-hidden rounded-full bg-[var(--control)]">
				<div class="h-full origin-left rounded-full bg-[var(--accent)] transition-transform" style:transform="scaleX({progress.finished ? 1 : share})"></div>
			</div>
		{/snippet}
	</Row>
</Section>
