<script lang="ts">
	import { Row, Section, Switch, watts } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import type { Battery } from './api';
	import ChargeLimit from './ChargeLimit.svelte';
	import { duration, wattHours } from './format';
	import Level from './Level.svelte';

	const LOW_LEVEL = 10;

	let { battery }: { battery: Battery } = $props();

	const desktop = useSettings<{ 'show-battery-percentage': boolean }>('org.gnome.desktop.interface', ['show-battery-percentage']);

	let power = $derived(battery.rate === null ? null : watts(battery.rate));
	let status = $derived.by(() => {
		switch (battery.charge) {
			case 'charging': {
				const charging = power ? `Charging at ${power}` : 'Charging';
				return battery.untilFull > 0 ? `${charging}, full in ${duration(battery.untilFull)}` : charging;
			}
			case 'discharging': {
				const left = battery.untilEmpty > 0 ? `About ${duration(battery.untilEmpty)} left` : 'On battery';
				return power ? `${left}, using ${power}` : left;
			}
			case 'full':
				return 'Fully charged';
			case 'empty':
				return 'Empty';
			case 'not-charging':
				return 'Plugged in, not charging';
		}
	});
	let health = $derived(battery.capacity ? (battery.capacity.full / battery.capacity.design) * 100 : null);
	let wear = $derived(
		[
			battery.capacity && `${wattHours(battery.capacity.full)} of ${wattHours(battery.capacity.design)} when new`,
			battery.cycles.length && `${battery.cycles.join(' and ')} charge cycles`
		]
			.filter(Boolean)
			.join(' · ')
	);
</script>

<Section title="Battery">
	<Row title="{Math.round(battery.level)}%" description={status}>
		{#snippet below()}
			<Level level={battery.level} low={battery.charge === 'discharging' && battery.level <= LOW_LEVEL} />
		{/snippet}
	</Row>
	{#if wear}
		<Row title="Battery health" description={wear}>
			{#if health !== null}
				<span class="tabular-nums">{Math.round(Math.min(health, 100))}%</span>
			{/if}
		</Row>
	{/if}
	<Row title="Show percentage" description="Shows the battery level next to the battery icon">
		<Switch
			label="Show percentage"
			checked={desktop.values['show-battery-percentage'] ?? false}
			onchange={(on) => desktop.set('show-battery-percentage', on)}
		/>
	</Row>
	{#if battery.limit}
		<ChargeLimit limit={battery.limit} />
	{/if}
</Section>
