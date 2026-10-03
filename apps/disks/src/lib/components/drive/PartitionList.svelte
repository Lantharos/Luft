<script lang="ts">
	import type { Drive } from '$lib/api';
	import { segmentKey } from '$lib/state/disks.svelte';
	import FreeRow from './FreeRow.svelte';
	import PartitionRow from './PartitionRow.svelte';
	import { tones } from './tones';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let palette = $derived(tones(drive));
</script>

<div class="row-group" role="list" aria-label="Partitions">
	{#each drive.segments as segment (segmentKey(segment))}
		{#if segment.kind === 'volume'}
			<PartitionRow {drive} volume={segment} tone={palette.get(segment.block) ?? 'var(--accent)'} />
		{:else}
			<FreeRow {drive} offset={segment.offset} size={segment.size} />
		{/if}
	{/each}
</div>
