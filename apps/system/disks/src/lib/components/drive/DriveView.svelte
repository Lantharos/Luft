<script lang="ts">
	import type { Drive } from '#lib/bindings.js';
	import { movingLuft } from '#lib/luft.js';
	import { disks } from '#lib/state/disks.svelte.js';
	import { systems } from '#lib/state/systems.svelte.js';
	import CapacityBar from './CapacityBar.svelte';
	import DriveHeader from './DriveHeader.svelte';
	import HealthRow from './HealthRow.svelte';
	import ImageProgress from './ImageProgress.svelte';
	import LuftMoveProgress from './LuftMoveProgress.svelte';
	import PartitionList from './partitions/PartitionList.svelte';
	import SystemRows from './partitions/SystemRows.svelte';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let blocks = $derived(new Set([drive.block, ...drive.segments.flatMap((segment) => (segment.kind === 'volume' ? [segment.block] : []))]));
	let others = $derived(systems.on(drive));
	let moving = $derived(movingLuft(drive, disks.protection) !== null);
	let imaging = $derived(disks.image && blocks.has(disks.image.block) ? disks.image : null);
</script>

<section class="flex flex-col gap-5">
	<DriveHeader {drive} />
	<CapacityBar {drive} />
	<PartitionList {drive} />
</section>

{#if moving}
	<LuftMoveProgress protection={disks.protection} />
{/if}

{#if others.length}
	<SystemRows systems={others} />
{/if}

{#if imaging}
	<ImageProgress progress={imaging} />
{/if}

{#if drive.health}
	<HealthRow {drive} health={drive.health} />
{/if}
