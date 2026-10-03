<script lang="ts">
	import type { Drive } from '$lib/api';
	import { bytes, driveKindName } from '$lib/format';
	import { disks } from '$lib/state/disks.svelte';
	import DriveActions from './DriveActions.svelte';
	import HealthSection from './HealthSection.svelte';
	import ImageProgress from './ImageProgress.svelte';
	import PartitionMap from './PartitionMap.svelte';
	import VolumePanel from './VolumePanel.svelte';

	interface Props {
		drive: Drive;
	}

	let { drive }: Props = $props();

	let summary = $derived(
		[bytes(drive.size), driveKindName(drive), drive.model !== drive.name ? drive.model : '', drive.device].filter(Boolean).join(' · ')
	);
	let blocks = $derived(new Set([drive.block, ...drive.segments.flatMap((segment) => (segment.kind === 'volume' ? [segment.block] : []))]));
	let imaging = $derived(disks.image && blocks.has(disks.image.block) ? disks.image : null);
</script>

<div class="flex items-start justify-between gap-4 px-1.5">
	<p class="min-w-0 pt-1 text-[14px] text-[var(--text-muted)]">{summary}</p>
	<DriveActions {drive} />
</div>

{#if drive.system}
	<p class="-mt-3 px-1.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
		This drive runs the system you're using right now, so its partitions can't be changed here.
	</p>
{/if}

{#if imaging}
	<ImageProgress progress={imaging} />
{/if}

<PartitionMap {drive} />

{#if disks.segment}
	<VolumePanel {drive} segment={disks.segment} />
{/if}

{#if drive.health}
	<HealthSection {drive} health={drive.health} />
{/if}
