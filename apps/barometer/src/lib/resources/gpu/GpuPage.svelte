<script lang="ts">
	import type { GpuInfo, GpuSample } from '#lib/backend/types.js';
	import { bytes, frequency, percent, temperature, watts } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { byId, shortGpuName } from '#lib/resources/registry.js';
	import { monitor } from '#lib/state/monitor.svelte.js';

	interface Props {
		info: GpuInfo;
	}

	let { info }: Props = $props();

	let gpu = $derived(monitor.latest ? byId(monitor.latest.gpus, info.id) : undefined);
	let memoryTotal = $derived(gpu?.memoryTotal ?? info.memoryTotal);

	function series(pick: (sample: GpuSample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.gpus, info.id);
			return sample ? pick(sample) : null;
		});
	}

	const present = (value: number | null | undefined) => value !== null && value !== undefined;
</script>

<Page title={shortGpuName(info.name)} detail={info.integrated ? 'Integrated graphics' : info.vendor}>
	<Chart
		title="Usage"
		tall
		max={100}
		lines={[{ values: series((sample) => sample.usage) }]}
		legend={[{ label: 'Now', value: percent(gpu?.usage ?? null) }]}
		scale={() => '100%'}
	/>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
		{#if present(gpu?.memoryUsed) && memoryTotal}
			<Chart
				title="Video memory"
				max={memoryTotal}
				lines={[{ values: series((sample) => sample.memoryUsed) }]}
				legend={[{ label: 'Now', value: `${bytes(gpu?.memoryUsed ?? 0)} of ${bytes(memoryTotal)}` }]}
				scale={(max) => bytes(max)}
			/>
		{/if}
		{#if present(gpu?.encoder) || present(gpu?.decoder)}
			<Chart
				title="Video engines"
				max={100}
				lines={[
					{ values: series((sample) => sample.decoder) },
					{ values: series((sample) => sample.encoder), tone: 'soft', fill: false }
				]}
				legend={[
					{ label: 'Decode', value: percent(gpu?.decoder ?? null) },
					{ label: 'Encode', value: percent(gpu?.encoder ?? null), tone: 'soft' }
				]}
			/>
		{/if}
		{#if present(gpu?.temperature)}
			<Chart
				title="Temperature"
				floor={60}
				lines={[{ values: series((sample) => sample.temperature) }]}
				legend={[{ label: 'Now', value: temperature(gpu?.temperature ?? null) }]}
				scale={(max) => temperature(max)}
			/>
		{/if}
		{#if present(gpu?.power)}
			<Chart
				title="Power"
				max={info.powerCap ?? undefined}
				floor={10}
				lines={[{ values: series((sample) => sample.power) }]}
				legend={[{ label: 'Now', value: watts(gpu?.power ?? null) }]}
				scale={(max) => watts(max)}
			/>
		{/if}
	</div>

	<Stats
		stats={[
			{ label: 'Usage', value: percent(gpu?.usage ?? null) },
			...(present(gpu?.memoryUsed) ? [{ label: 'Video memory', value: bytes(gpu?.memoryUsed ?? 0), detail: memoryTotal ? `of ${bytes(memoryTotal)}` : undefined }] : []),
			...(present(gpu?.clock) ? [{ label: 'Clock', value: frequency(gpu?.clock ?? null), detail: info.maxClock ? `Up to ${frequency(info.maxClock)}` : undefined }] : []),
			...(present(gpu?.memoryClock) ? [{ label: 'Memory clock', value: frequency(gpu?.memoryClock ?? null) }] : []),
			...(present(gpu?.power) ? [{ label: 'Power', value: watts(gpu?.power ?? null), detail: info.powerCap ? `Limit ${watts(info.powerCap)}` : undefined }] : []),
			...(present(gpu?.temperature) ? [{ label: 'Temperature', value: temperature(gpu?.temperature ?? null) }] : []),
			...(present(gpu?.fan) ? [{ label: 'Fan', value: percent(gpu?.fan ?? null) }] : [])
		]}
	/>

	<Facts
		title="Details"
		facts={[
			{ label: 'Model', value: info.name },
			{ label: 'Manufacturer', value: info.vendor },
			{ label: 'Driver', value: [info.driver, info.driverVersion].filter(Boolean).join(' ') },
			{ label: 'Slot', value: info.slot, mono: true },
			{ label: 'Link', value: info.link },
			{ label: 'Video memory', value: memoryTotal ? bytes(memoryTotal) : null },
			{ label: 'Power limit', value: info.powerCap ? watts(info.powerCap) : null },
			{ label: 'Highest clock', value: info.maxClock ? frequency(info.maxClock) : null },
			{ label: 'Highest memory clock', value: info.maxMemoryClock ? frequency(info.maxMemoryClock) : null }
		]}
	/>
</Page>
