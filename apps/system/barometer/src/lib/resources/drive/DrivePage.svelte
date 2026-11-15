<script lang="ts">
	import { t } from '@luft/i18n';
	import { bytes } from '@luft/ui';
	import type { DriveInfo, DriveSample } from '#lib/bindings.js';
	import { percent, rate, temperature } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Meter from '#lib/resources/common/Meter.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { byId, driveKinds } from '#lib/resources/registry.js';
	import { monitor } from '#lib/state/monitor.svelte.js';

	interface Props {
		info: DriveInfo;
	}

	const TRANSFER_FLOOR = 1024 * 1024;

	let { info }: Props = $props();

	let drive = $derived(monitor.latest ? byId(monitor.latest.drives, info.id) : undefined);
	let space = $derived(drive?.space);
	let kind = $derived(driveKinds()[info.kind]);
	let label = $derived({
		busy: t('barometer-drive-busy'),
		read: t('barometer-drive-read'),
		write: t('barometer-drive-write'),
		reading: t('barometer-column-read'),
		writing: t('barometer-column-write'),
		readTotal: t('barometer-drive-read-total'),
		writeTotal: t('barometer-drive-write-total'),
		temperature: t('barometer-temperature'),
		used: t('barometer-drive-used'),
		free: t('barometer-free'),
		yes: t('barometer-yes'),
		model: t('barometer-model'),
		kind: t('barometer-drive-kind'),
		device: t('barometer-drive-device'),
		capacity: t('barometer-drive-capacity'),
		mounted: t('barometer-drive-mounted'),
		removable: t('barometer-drive-removable'),
		readOnly: t('barometer-drive-read-only')
	});

	function series(pick: (sample: DriveSample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.drives, info.id);
			return sample ? pick(sample) : null;
		});
	}
</script>

<Page title={info.model ?? info.name} detail={`${kind} · ${bytes(info.size)}`}>
	<Chart
		title={t('barometer-drive-activity')}
		tall
		max={100}
		lines={[{ values: series((sample) => sample.busy) }]}
		legend={[{ label: label.busy, value: percent(drive?.busy ?? null) }]}
		scale={() => percent(100)}
	/>

	<Chart
		title={t('barometer-drive-speed')}
		floor={TRANSFER_FLOOR}
		binary
		lines={[
			{ values: series((sample) => sample.read) },
			{ values: series((sample) => sample.write), tone: 'soft', fill: false }
		]}
		legend={[
			{ label: label.read, value: rate(drive?.read ?? 0) },
			{ label: label.write, value: rate(drive?.write ?? 0), tone: 'soft' }
		]}
		scale={(max) => rate(max)}
	/>

	<Stats
		stats={[
			{ label: label.busy, value: percent(drive?.busy ?? null) },
			{ label: label.reading, value: rate(drive?.read ?? 0) },
			{ label: label.writing, value: rate(drive?.write ?? 0) },
			{ label: label.readTotal, value: bytes(drive?.readTotal ?? 0) },
			{ label: label.writeTotal, value: bytes(drive?.writeTotal ?? 0) },
			...(drive?.temperature != null ? [{ label: label.temperature, value: temperature(drive.temperature) }] : [])
		]}
	/>

	{#if space && space.size > 0}
		<section class="flex flex-col gap-3">
			<h2 class="px-1 text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-drive-space')}</h2>
			<Meter
				label={t('barometer-drive-space-label')}
				total={space.size}
				segments={[
					{ label: label.used, value: space.used, display: bytes(space.used), tone: 'accent' },
					{ label: label.free, value: space.size - space.used, display: bytes(space.size - space.used), tone: 'empty' }
				]}
			/>
		</section>
	{/if}

	<Facts
		title={t('barometer-details')}
		facts={[
			{ label: label.model, value: info.model },
			{ label: label.kind, value: kind },
			{ label: label.device, value: `/dev/${info.name}`, mono: true },
			{ label: label.capacity, value: bytes(info.size) },
			{ label: label.mounted, value: space?.mounts.join(', ') },
			{ label: label.removable, value: info.removable ? label.yes : null },
			{ label: label.readOnly, value: info.readOnly ? label.yes : null }
		]}
	/>
</Page>
