<script lang="ts">
	import { t } from '@luft/i18n';
	import { duration, memoryBytes, Switch } from '@luft/ui';
	import type { CpuInfo } from '#lib/bindings.js';
	import { count, fixed, frequency, percent, temperature } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { monitor } from '#lib/state/monitor.svelte.js';
	import { settings } from '#lib/state/settings.svelte.js';
	import CoreGrid from './CoreGrid.svelte';

	interface Props {
		info: CpuInfo;
	}

	let { info }: Props = $props();

	let cpu = $derived(monitor.latest?.cpu);
	let speed = $derived(cpu?.frequencies?.length ? cpu.frequencies.reduce((sum, value) => sum + value, 0) / cpu.frequencies.length : null);
	let temperatures = $derived(monitor.ticks.map((tick) => tick.cpu.temperature));
	let hasTemperature = $derived(temperatures.some((value) => value !== null));
	let label = $derived({
		utilization: t('barometer-cpu-utilization'),
		now: t('barometer-now'),
		speed: t('barometer-cpu-speed'),
		upTo: info.maxFrequency ? t('barometer-up-to', { value: frequency(info.maxFrequency) }) : undefined,
		temperature: t('barometer-temperature'),
		threads: t('barometer-column-threads'),
		load: t('barometer-cpu-load'),
		loadDetail: t('barometer-cpu-load-detail'),
		switches: t('barometer-cpu-switches'),
		uptime: t('barometer-cpu-uptime')
	});

	function caches() {
		return info.caches.map((cache) => ({
			label: t('barometer-cpu-cache', { level: cache.level, kind: cache.kind }),
			value: cache.instances > 1 ? `${memoryBytes(cache.size)} × ${cache.instances}` : memoryBytes(cache.size)
		}));
	}
</script>

<Page title={t('barometer-cpu-title')} detail={info.name}>
	<Chart
		title={label.utilization}
		tall
		max={100}
		lines={[{ values: monitor.ticks.map((tick) => tick.cpu.usage) }]}
		legend={[{ label: label.now, value: percent(cpu?.usage ?? null) }]}
		scale={() => percent(100)}
	/>

	<Stats
		stats={[
			{ label: label.utilization, value: percent(cpu?.usage ?? null) },
			{ label: label.speed, value: frequency(speed), detail: label.upTo },
			{ label: label.temperature, value: temperature(cpu?.temperature ?? null) },
			{ label: label.threads, value: cpu ? count(cpu.threads) : '–' },
			{ label: label.load, value: cpu ? cpu.load.map((value) => fixed(value, 2)).join('  ') : '–', detail: label.loadDetail },
			{ label: label.switches, value: cpu ? `${count(cpu.switches)}/s` : '–' },
			{ label: label.uptime, value: cpu ? duration(cpu.uptime) : '–' }
		]}
	/>

	<section class="flex flex-col gap-3">
		<div class="flex items-center justify-between gap-4 px-1">
			<h2 class="text-[13px] font-medium text-[var(--text-soft)]">{t('barometer-cpu-cores-title')}</h2>
			<Switch label={t('barometer-cpu-cores-show')} checked={settings.value.showCores} onchange={(showCores) => settings.update({ showCores })} />
		</div>
		{#if settings.value.showCores}
			<CoreGrid count={info.logical} />
		{/if}
	</section>

	{#if hasTemperature}
		<Chart
			title={label.temperature}
			floor={60}
			lines={[{ values: temperatures }]}
			legend={[{ label: label.now, value: temperature(cpu?.temperature ?? null) }]}
			scale={(max) => temperature(max)}
		/>
	{/if}

	<Facts
		title={t('barometer-details')}
		facts={[
			{ label: t('barometer-model'), value: info.name },
			{ label: t('barometer-cpu-cores'), value: t('barometer-cpu-cores-value', { cores: info.physical, threads: info.logical }) },
			{ label: t('barometer-cpu-sockets'), value: String(info.sockets) },
			{
				label: t('barometer-cpu-frequency-range'),
				value: info.minFrequency && info.maxFrequency ? t('barometer-range', { from: frequency(info.minFrequency), to: frequency(info.maxFrequency) }) : null
			},
			{ label: t('barometer-cpu-scaling'), value: info.governor },
			{ label: t('barometer-cpu-virtualization'), value: info.virtualization },
			{ label: t('barometer-cpu-architecture'), value: info.architecture },
			...caches()
		]}
	/>
</Page>
