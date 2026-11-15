<script lang="ts">
	import { t } from '@luft/i18n';
	import { memoryBytes, watts } from '@luft/ui';
	import type { GpuInfo, GpuSample } from '#lib/bindings.js';
	import { frequency, percent, temperature } from '#lib/format.js';
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
	let total = $derived(memoryTotal ? memoryBytes(memoryTotal) : null);
	let ofTotal = $derived(total ? t('barometer-of', { total }) : undefined);
	let label = $derived({
		usage: t('barometer-gpu-usage'),
		now: t('barometer-now'),
		memory: t('barometer-column-vram'),
		decode: t('barometer-column-decoder'),
		encode: t('barometer-column-encoder'),
		temperature: t('barometer-temperature'),
		power: t('barometer-gpu-power'),
		clock: t('barometer-gpu-clock'),
		upTo: info.maxClock ? t('barometer-up-to', { value: frequency(info.maxClock) }) : undefined,
		memoryClock: t('barometer-gpu-memory-clock'),
		limit: info.powerCap ? t('barometer-gpu-power-limit-value', { power: watts(info.powerCap) }) : undefined,
		fan: t('barometer-gpu-fan')
	});

	function series(pick: (sample: GpuSample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.gpus, info.id);
			return sample ? pick(sample) : null;
		});
	}

	const present = (value: number | null | undefined) => value !== null && value !== undefined;
</script>

<Page title={shortGpuName(info.name)} detail={info.integrated ? t('barometer-gpu-integrated') : info.vendor}>
	<Chart
		title={label.usage}
		tall
		max={100}
		lines={[{ values: series((sample) => sample.usage) }]}
		legend={[{ label: label.now, value: percent(gpu?.usage ?? null) }]}
		scale={() => percent(100)}
	/>

	<div class="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
		{#if present(gpu?.memoryUsed) && memoryTotal}
			<Chart
				title={label.memory}
				max={memoryTotal}
				lines={[{ values: series((sample) => sample.memoryUsed) }]}
				legend={[{ label: label.now, value: t('barometer-used-of', { used: memoryBytes(gpu?.memoryUsed ?? 0), total: memoryBytes(memoryTotal) }) }]}
				scale={(max) => memoryBytes(max)}
			/>
		{/if}
		{#if present(gpu?.encoder) || present(gpu?.decoder)}
			<Chart
				title={t('barometer-gpu-engines')}
				max={100}
				lines={[
					{ values: series((sample) => sample.decoder) },
					{ values: series((sample) => sample.encoder), tone: 'soft', fill: false }
				]}
				legend={[
					{ label: label.decode, value: percent(gpu?.decoder ?? null) },
					{ label: label.encode, value: percent(gpu?.encoder ?? null), tone: 'soft' }
				]}
			/>
		{/if}
		{#if present(gpu?.temperature)}
			<Chart
				title={label.temperature}
				floor={60}
				lines={[{ values: series((sample) => sample.temperature) }]}
				legend={[{ label: label.now, value: temperature(gpu?.temperature ?? null) }]}
				scale={(max) => temperature(max)}
			/>
		{/if}
		{#if gpu?.power != null}
			<Chart
				title={label.power}
				max={info.powerCap ?? undefined}
				floor={10}
				lines={[{ values: series((sample) => sample.power) }]}
				legend={[{ label: label.now, value: watts(gpu.power) }]}
				scale={(max) => watts(max)}
			/>
		{/if}
	</div>

	<Stats
		stats={[
			{ label: label.usage, value: percent(gpu?.usage ?? null) },
			...(present(gpu?.memoryUsed) ? [{ label: label.memory, value: memoryBytes(gpu?.memoryUsed ?? 0), detail: ofTotal }] : []),
			...(present(gpu?.clock) ? [{ label: label.clock, value: frequency(gpu?.clock ?? null), detail: label.upTo }] : []),
			...(present(gpu?.memoryClock) ? [{ label: label.memoryClock, value: frequency(gpu?.memoryClock ?? null) }] : []),
			...(gpu?.power != null ? [{ label: label.power, value: watts(gpu.power), detail: label.limit }] : []),
			...(present(gpu?.temperature) ? [{ label: label.temperature, value: temperature(gpu?.temperature ?? null) }] : []),
			...(present(gpu?.fan) ? [{ label: label.fan, value: percent(gpu?.fan ?? null) }] : [])
		]}
	/>

	<Facts
		title={t('barometer-details')}
		facts={[
			{ label: t('barometer-model'), value: info.name },
			{ label: t('barometer-manufacturer'), value: info.vendor },
			{ label: t('barometer-driver'), value: [info.driver, info.driverVersion].filter(Boolean).join(' ') },
			{ label: t('barometer-gpu-slot'), value: info.slot, mono: true },
			{ label: t('barometer-gpu-link'), value: info.link },
			{ label: label.memory, value: total },
			{ label: t('barometer-gpu-power-limit'), value: info.powerCap ? watts(info.powerCap) : null },
			{ label: t('barometer-gpu-max-clock'), value: info.maxClock ? frequency(info.maxClock) : null },
			{ label: t('barometer-gpu-max-memory-clock'), value: info.maxMemoryClock ? frequency(info.maxMemoryClock) : null }
		]}
	/>
</Page>
