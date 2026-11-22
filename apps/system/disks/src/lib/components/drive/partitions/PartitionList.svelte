<script lang="ts">
	import { t } from '@luft/i18n';
	import type { Drive } from '#lib/bindings.js';
	import { movingLuft } from '#lib/luft.js';
	import { disks, segmentKey } from '#lib/state/disks.svelte.js';
	import FreeRow from './FreeRow.svelte';
	import PartitionRow from './PartitionRow.svelte';
	import { tones } from '../tones';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let moving = $derived(movingLuft(drive, disks.protection));
	let palette = $derived(tones(drive, moving));
</script>

<div class="row-group" role="list" aria-label={t('disks-partitions')}>
	{#each drive.segments as segment (segmentKey(segment))}
		{#if segment.kind === 'free'}
			<FreeRow {drive} offset={segment.offset} size={segment.size} />
		{:else if !moving?.hidden.has(segment.block)}
			<PartitionRow {drive} volume={segment} tone={palette.get(segment.block) ?? 'var(--accent)'} />
		{/if}
	{/each}
</div>
