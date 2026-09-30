<script lang="ts">
	import type { DriveInfo, DriveSample } from '$lib/backend/types';
	import { bytes, percent, rate, temperature } from '$lib/format';
	import Chart from '$lib/resources/common/Chart.svelte';
	import Facts from '$lib/resources/common/Facts.svelte';
	import Meter from '$lib/resources/common/Meter.svelte';
	import Page from '$lib/resources/common/Page.svelte';
	import Stats from '$lib/resources/common/Stats.svelte';
	import { byId, DRIVE_KINDS } from '$lib/resources/registry';
	import { monitor } from '$lib/state/monitor.svelte';

	interface Props {
		info: DriveInfo;
	}

	const TRANSFER_FLOOR = 1024 * 1024;

	let { info }: Props = $props();

	let drive = $derived(monitor.latest ? byId(monitor.latest.drives, info.id) : undefined);
	let space = $derived(drive?.space);

	function series(pick: (sample: DriveSample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.drives, info.id);
			return sample ? pick(sample) : null;
		});
	}
</script>

<Page title={info.model ?? info.name} detail={`${DRIVE_KINDS[info.kind]} · ${bytes(info.size)}`}>
	<Chart
		title="Activity"
		tall
		max={100}
		lines={[{ values: series((sample) => sample.busy) }]}
		legend={[{ label: 'Busy', value: percent(drive?.busy ?? null) }]}
		scale={() => '100%'}
	/>

	<Chart
		title="Transfer speed"
		floor={TRANSFER_FLOOR}
		binary
		lines={[
			{ values: series((sample) => sample.read) },
			{ values: series((sample) => sample.write), tone: 'soft', fill: false }
		]}
		legend={[
			{ label: 'Read', value: rate(drive?.read ?? 0) },
			{ label: 'Write', value: rate(drive?.write ?? 0), tone: 'soft' }
		]}
		scale={(max) => rate(max)}
	/>

	<Stats
		stats={[
			{ label: 'Busy', value: percent(drive?.busy ?? null) },
			{ label: 'Reading', value: rate(drive?.read ?? 0) },
			{ label: 'Writing', value: rate(drive?.write ?? 0) },
			{ label: 'Read since startup', value: bytes(drive?.readTotal ?? 0) },
			{ label: 'Written since startup', value: bytes(drive?.writeTotal ?? 0) },
			...(drive?.temperature != null ? [{ label: 'Temperature', value: temperature(drive.temperature) }] : [])
		]}
	/>

	{#if space && space.size > 0}
		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-[13px] font-medium text-[var(--text-soft)]">Space</h2>
			<Meter
				label="Space used"
				total={space.size}
				segments={[
					{ label: 'Used', value: space.used, display: bytes(space.used), tone: 'accent' },
					{ label: 'Free', value: space.size - space.used, display: bytes(space.size - space.used), tone: 'empty' }
				]}
			/>
		</section>
	{/if}

	<Facts
		title="Details"
		facts={[
			{ label: 'Model', value: info.model },
			{ label: 'Kind', value: DRIVE_KINDS[info.kind] },
			{ label: 'Device', value: `/dev/${info.name}`, mono: true },
			{ label: 'Capacity', value: bytes(info.size) },
			{ label: 'Mounted at', value: space?.mounts.join(', ') },
			{ label: 'Removable', value: info.removable ? 'Yes' : null },
			{ label: 'Read only', value: info.readOnly ? 'Yes' : null }
		]}
	/>
</Page>
