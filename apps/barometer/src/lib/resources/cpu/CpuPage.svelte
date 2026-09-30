<script lang="ts">
	import { Switch } from '@luft/ui';
	import type { CpuInfo } from '$lib/backend/types';
	import { bytes, count, duration, frequency, percent, plural, temperature } from '$lib/format';
	import Chart from '$lib/resources/common/Chart.svelte';
	import Facts from '$lib/resources/common/Facts.svelte';
	import Page from '$lib/resources/common/Page.svelte';
	import Stats from '$lib/resources/common/Stats.svelte';
	import { monitor } from '$lib/state/monitor.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import CoreGrid from './CoreGrid.svelte';

	interface Props {
		info: CpuInfo;
	}

	let { info }: Props = $props();

	let cpu = $derived(monitor.latest?.cpu);
	let speed = $derived(cpu?.frequencies?.length ? cpu.frequencies.reduce((sum, value) => sum + value, 0) / cpu.frequencies.length : null);
	let temperatures = $derived(monitor.ticks.map((tick) => tick.cpu.temperature));
	let hasTemperature = $derived(temperatures.some((value) => value !== null));

	function caches() {
		return info.caches.map((cache) => ({
			label: `L${cache.level}${cache.kind === 'Data' ? 'd' : cache.kind === 'Instruction' ? 'i' : ''} cache`,
			value: cache.instances > 1 ? `${bytes(cache.size)} × ${cache.instances}` : bytes(cache.size)
		}));
	}
</script>

<Page title="Processor" detail={info.name}>
	<Chart
		title="Utilization"
		tall
		max={100}
		lines={[{ values: monitor.ticks.map((tick) => tick.cpu.usage) }]}
		legend={[{ label: 'Now', value: percent(cpu?.usage ?? null) }]}
		scale={() => '100%'}
	/>

	<Stats
		stats={[
			{ label: 'Utilization', value: percent(cpu?.usage ?? null) },
			{ label: 'Speed', value: frequency(speed), detail: info.maxFrequency ? `Up to ${frequency(info.maxFrequency)}` : undefined },
			{ label: 'Temperature', value: temperature(cpu?.temperature ?? null) },
			{ label: 'Threads', value: cpu ? count(cpu.threads) : '–' },
			{ label: 'Load average', value: cpu ? cpu.load.map((value) => value.toFixed(2)).join('  ') : '–', detail: '1, 5 and 15 minutes' },
			{ label: 'Context switches', value: cpu ? `${count(cpu.switches)}/s` : '–' },
			{ label: 'Up for', value: cpu ? duration(cpu.uptime) : '–' }
		]}
	/>

	<section class="flex flex-col gap-3">
		<div class="flex items-center justify-between gap-4 px-1">
			<h2 class="text-[13px] font-medium text-[var(--text-soft)]">Each core</h2>
			<Switch label="Show each core" checked={settings.value.showCores} onchange={(showCores) => settings.update({ showCores })} />
		</div>
		{#if settings.value.showCores}
			<CoreGrid count={info.logical} />
		{/if}
	</section>

	{#if hasTemperature}
		<Chart
			title="Temperature"
			floor={60}
			lines={[{ values: temperatures }]}
			legend={[{ label: 'Now', value: temperature(cpu?.temperature ?? null) }]}
			scale={(max) => temperature(max)}
		/>
	{/if}

	<Facts
		title="Details"
		facts={[
			{ label: 'Model', value: info.name },
			{ label: 'Cores', value: `${plural(info.physical, 'core')}, ${plural(info.logical, 'thread')}` },
			{ label: 'Sockets', value: String(info.sockets) },
			{ label: 'Frequency range', value: info.minFrequency && info.maxFrequency ? `${frequency(info.minFrequency)} – ${frequency(info.maxFrequency)}` : null },
			{ label: 'Scaling', value: info.governor },
			{ label: 'Virtualization', value: info.virtualization },
			{ label: 'Architecture', value: info.architecture },
			...caches()
		]}
	/>
</Page>
