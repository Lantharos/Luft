<script lang="ts">
	import { t } from '@luft/i18n';
	import { duration, watts } from '@luft/ui';
	import type { BatteryInfo, BatterySample } from '#lib/bindings.js';
	import { fixed, percent, share } from '#lib/format.js';
	import Chart from '#lib/resources/common/Chart.svelte';
	import Facts from '#lib/resources/common/Facts.svelte';
	import Page from '#lib/resources/common/Page.svelte';
	import Stats from '#lib/resources/common/Stats.svelte';
	import { byId } from '#lib/resources/registry.js';
	import { monitor } from '#lib/state/monitor.svelte.js';

	interface Props {
		info: BatteryInfo;
	}

	let { info }: Props = $props();

	let battery = $derived(monitor.latest ? byId(monitor.latest.batteries, info.id) : undefined);
	let label = $derived({
		states: {
			Charging: t('barometer-battery-state-charging'),
			Discharging: t('barometer-battery-state-discharging'),
			Full: t('barometer-battery-state-full'),
			'Not charging': t('barometer-battery-state-not-charging')
		} as Record<string, string>,
		now: t('barometer-now'),
		charge: t('barometer-battery-charge'),
		chargingRate: t('barometer-battery-charging-rate'),
		powerDraw: t('barometer-battery-power-draw'),
		fullIn: t('barometer-battery-full-in'),
		timeLeft: t('barometer-battery-time-left'),
		chargingAt: t('barometer-battery-charging-at'),
		drawing: t('barometer-battery-drawing'),
		health: t('barometer-battery-health'),
		healthDetail: t('barometer-battery-health-detail'),
		cycles: t('barometer-battery-cycles'),
		status: t('barometer-battery-status'),
		pluggedIn: t('barometer-battery-plugged-in'),
		yes: t('barometer-yes'),
		no: t('barometer-no'),
		energy: t('barometer-battery-energy'),
		energyFull: t('barometer-battery-energy-full'),
		energyDesign: t('barometer-battery-energy-design'),
		voltage: t('barometer-battery-voltage'),
		technology: t('barometer-battery-technology'),
		manufacturer: t('barometer-manufacturer'),
		model: t('barometer-model')
	});
	let state = $derived(battery ? (label.states[battery.state] ?? battery.state) : null);
	let health = $derived(battery?.energyFull && battery.energyDesign ? share(battery.energyFull, battery.energyDesign) : null);

	function series(pick: (sample: BatterySample) => number | null) {
		return monitor.ticks.map((tick) => {
			const sample = byId(tick.batteries, info.id);
			return sample ? pick(sample) : null;
		});
	}

	function energy(value: number | null | undefined) {
		return value ? `${fixed(value, 1)} Wh` : null;
	}
</script>

<Page title={t('barometer-battery-title')} detail={state}>
	<Chart
		title={label.charge}
		tall
		max={100}
		lines={[{ values: series((sample) => sample.charge) }]}
		legend={[{ label: label.now, value: percent(battery?.charge ?? null) }]}
		scale={() => percent(100)}
	/>

	{#if battery?.power != null}
		<Chart
			title={battery.state === 'Charging' ? label.chargingRate : label.powerDraw}
			floor={5}
			lines={[{ values: series((sample) => sample.power) }]}
			legend={[{ label: label.now, value: watts(battery.power) }]}
			scale={(max) => watts(max)}
		/>
	{/if}

	<Stats
		stats={[
			{ label: label.charge, value: percent(battery?.charge ?? null) },
			{
				label: battery?.state === 'Charging' ? label.fullIn : label.timeLeft,
				value: battery?.secondsLeft ? duration(battery.secondsLeft) : '–'
			},
			{ label: battery?.state === 'Charging' ? label.chargingAt : label.drawing, value: battery?.power == null ? '–' : watts(battery.power) },
			{ label: label.health, value: percent(health), detail: label.healthDetail },
			{ label: label.cycles, value: battery?.cycles ? String(battery.cycles) : '–' }
		]}
	/>

	<Facts
		title={t('barometer-details')}
		facts={[
			{ label: label.status, value: state },
			{ label: label.pluggedIn, value: battery ? (battery.pluggedIn ? label.yes : label.no) : null },
			{ label: label.energy, value: energy(battery?.energy) },
			{ label: label.energyFull, value: energy(battery?.energyFull) },
			{ label: label.energyDesign, value: energy(battery?.energyDesign) },
			{ label: label.voltage, value: battery?.voltage ? `${fixed(battery.voltage, 1)} V` : null },
			{ label: label.technology, value: info.technology },
			{ label: label.manufacturer, value: info.manufacturer },
			{ label: label.model, value: info.model }
		]}
	/>
</Page>
