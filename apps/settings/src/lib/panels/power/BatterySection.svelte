<script lang="ts">
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import type { Battery } from './api';
	import { duration } from './duration';
	import Level from './Level.svelte';

	const LOW_LEVEL = 10;

	let { battery }: { battery: Battery } = $props();

	const desktop = useSettings<{ 'show-battery-percentage': boolean }>('org.gnome.desktop.interface', ['show-battery-percentage']);

	let status = $derived.by(() => {
		switch (battery.charge) {
			case 'charging':
				return battery.untilFull > 0 ? `Charging, full in ${duration(battery.untilFull)}` : 'Charging';
			case 'discharging':
				return battery.untilEmpty > 0 ? `About ${duration(battery.untilEmpty)} left` : 'On battery';
			case 'full':
				return 'Fully charged';
			case 'empty':
				return 'Empty';
			case 'not-charging':
				return 'Plugged in, not charging';
		}
	});
</script>

<Section title="Battery">
	<Row title="{Math.round(battery.level)}%" description={status}>
		{#snippet below()}
			<Level level={battery.level} low={battery.charge === 'discharging' && battery.level <= LOW_LEVEL} />
		{/snippet}
	</Row>
	{#if battery.health !== null}
		<Row title="Battery health" description="How much charge it holds compared to when it was new">
			<span class="tabular-nums">{Math.round(battery.health)}%</span>
		</Row>
	{/if}
	<Row title="Show percentage" description="Shows the battery level next to the battery icon">
		<Switch
			label="Show percentage"
			checked={desktop.values['show-battery-percentage'] ?? false}
			onchange={(on) => desktop.set('show-battery-percentage', on)}
		/>
	</Row>
</Section>
