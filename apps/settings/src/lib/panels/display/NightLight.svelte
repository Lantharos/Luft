<script lang="ts">
	import { Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';

	type Color = {
		'night-light-enabled': boolean;
		'night-light-schedule-automatic': boolean;
		'night-light-schedule-from': number;
		'night-light-schedule-to': number;
		'night-light-temperature': number;
	};
	type Clock = { 'clock-format': string };

	const COOLEST = 4700;
	const WARMEST = 1700;

	const color = useSettings<Color>('org.gnome.settings-daemon.plugins.color', [
		'night-light-enabled',
		'night-light-schedule-automatic',
		'night-light-schedule-from',
		'night-light-schedule-to',
		'night-light-temperature'
	]);
	const clock = useSettings<Clock>('org.gnome.desktop.interface', ['clock-format']);

	let enabled = $derived(color.values['night-light-enabled'] ?? false);
	let automatic = $derived(color.values['night-light-schedule-automatic'] ?? true);
	let twelveHour = $derived(clock.values['clock-format'] === '12h');
	let warmth = $derived((COOLEST - (color.values['night-light-temperature'] ?? 2700)) / (COOLEST - WARMEST));

	const setWarmth = (value: number) => color.set('night-light-temperature', Math.round(COOLEST - value * (COOLEST - WARMEST)));
</script>

<Section>
	<Row title="Night light" description="Shifts colors warmer in the evening, which is easier on your eyes">
		<Switch label="Night light" checked={enabled} onchange={(on) => color.set('night-light-enabled', on)} />
	</Row>
	{#if enabled}
		<Row title="Schedule">
			<Segmented
				label="Schedule"
				options={[
					{ value: 'automatic', label: 'Sunset to sunrise' },
					{ value: 'custom', label: 'Custom' }
				]}
				value={automatic ? 'automatic' : 'custom'}
				onchange={(schedule) => color.set('night-light-schedule-automatic', schedule === 'automatic')}
			/>
		</Row>
		{#if !automatic}
			<Row title="Turns on">
				<TimePicker label="Turns on" {twelveHour} value={color.values['night-light-schedule-from'] ?? 20} onchange={(hours) => color.set('night-light-schedule-from', hours)} />
			</Row>
			<Row title="Turns off">
				<TimePicker label="Turns off" {twelveHour} value={color.values['night-light-schedule-to'] ?? 6} onchange={(hours) => color.set('night-light-schedule-to', hours)} />
			</Row>
		{/if}
		<Row title="Warmth">
			{#snippet below()}
				<Slider label="Warmth" value={warmth} format={percent} oninput={setWarmth} onchange={setWarmth} />
			{/snippet}
		</Row>
	{/if}
</Section>
