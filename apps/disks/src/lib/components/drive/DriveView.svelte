<script lang="ts">
	import type { Drive } from '$lib/api';
	import { disks } from '$lib/state/disks.svelte';
	import CapacityBar from './CapacityBar.svelte';
	import DriveHeader from './DriveHeader.svelte';
	import HealthRow from './HealthRow.svelte';
	import ImageProgress from './ImageProgress.svelte';
	import PartitionList from './PartitionList.svelte';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let blocks = $derived(new Set([drive.block, ...drive.segments.flatMap((segment) => (segment.kind === 'volume' ? [segment.block] : []))]));
	let imaging = $derived(disks.image && blocks.has(disks.image.block) ? disks.image : null);
</script>

<section class="flex flex-col gap-5">
	<DriveHeader {drive} />
	<CapacityBar {drive} />
	<PartitionList {drive} />
</section>

{#if imaging}
	<ImageProgress progress={imaging} />
{/if}

{#if drive.health}
	<HealthRow {drive} health={drive.health} />
{/if}
