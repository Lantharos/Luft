<script lang="ts">
	import type { BatteryInfo, BatterySample } from '$lib/backend/types';
	import { duration, percent, share, watts } from '$lib/format';
	import Chart from '$lib/resources/common/Chart.svelte';
	import Facts from '$lib/resources/common/Facts.svelte';
	import Page from '$lib/resources/common/Page.svelte';
	import Stats from '$lib/resources/common/Stats.svelte';
	import { byId } from '$lib/resources/registry';
	import { monitor } from '$lib/state/monitor.svelte';

	interface Props {
		info: BatteryInfo;
	}

	const STATES: Record<string, string> = { Charging: 'Charging', Discharging: 'On battery', Full: 'Fully charged', 'Not charging': 'Not charging' };

	let { info }: Props = $props();

	let battery = $derived(monitor.latest ? byId(monitor.latest.batteries, info.id) : undefined);
	let health = $derived(battery?.energyFull && battery.energyDesign ? share(battery.energyFull, battery.energyDesign) : null);

	function series(pick: (sample: BatterySample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.batteries, info.id);
			return sample ? pick(sample) : null;
		});
	}

	function energy(value: number | null | undefined) {
		return value ? `${value.toFixed(1)} Wh` : null;
	}
</script>

<Page title="Battery" detail={battery ? (STATES[battery.state] ?? battery.state) : null}>
	<Chart
		title="Charge"
		tall
		max={100}
		lines={[{ values: series((sample) => sample.charge) }]}
		legend={[{ label: 'Now', value: percent(battery?.charge ?? null) }]}
		scale={() => '100%'}
	/>

	{#if battery?.power != null}
		<Chart
			title={battery.state === 'Charging' ? 'Charging rate' : 'Power draw'}
			floor={5}
			lines={[{ values: series((sample) => sample.power) }]}
			legend={[{ label: 'Now', value: watts(battery.power) }]}
			scale={(max) => watts(max)}
		/>
	{/if}

	<Stats
		stats={[
			{ label: 'Charge', value: percent(battery?.charge ?? null) },
			{
				label: battery?.state === 'Charging' ? 'Full in' : 'Time left',
				value: battery?.secondsLeft ? duration(battery.secondsLeft) : '–'
			},
			{ label: battery?.state === 'Charging' ? 'Charging at' : 'Drawing', value: watts(battery?.power ?? null) },
			{ label: 'Health', value: percent(health), detail: 'Capacity compared to new' },
			{ label: 'Charge cycles', value: battery?.cycles ? String(battery.cycles) : '–' }
		]}
	/>

	<Facts
		title="Details"
		facts={[
			{ label: 'Status', value: battery ? (STATES[battery.state] ?? battery.state) : null },
			{ label: 'Plugged in', value: battery ? (battery.pluggedIn ? 'Yes' : 'No') : null },
			{ label: 'Energy', value: energy(battery?.energy) },
			{ label: 'Full charge', value: energy(battery?.energyFull) },
			{ label: 'Designed for', value: energy(battery?.energyDesign) },
			{ label: 'Voltage', value: battery?.voltage ? `${battery.voltage.toFixed(1)} V` : null },
			{ label: 'Technology', value: info.technology },
			{ label: 'Manufacturer', value: info.manufacturer },
			{ label: 'Model', value: info.model }
		]}
	/>
</Page>
