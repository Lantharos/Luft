<script lang="ts">
	import { Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import TimePicker from '$lib/components/TimePicker.svelte';

	type Color = {
		enabled: boolean;
		'schedule-automatic': boolean;
		'schedule-from': number;
		'schedule-to': number;
		temperature: number;
	};
	type Clock = { 'clock-format': string };

	const COOLEST = 4700;
	const WARMEST = 1700;

	const color = useSettings<Color>('com.lantharos.kestrel.night-light', [
		'enabled',
		'schedule-automatic',
		'schedule-from',
		'schedule-to',
		'temperature'
	]);
	const clock = useSettings<Clock>('org.gnome.desktop.interface', ['clock-format']);

	let enabled = $derived(color.values.enabled ?? false);
	let automatic = $derived(color.values['schedule-automatic'] ?? true);
	let twelveHour = $derived(clock.values['clock-format'] === '12h');
	let warmth = $derived((COOLEST - (color.values.temperature ?? 2700)) / (COOLEST - WARMEST));

	const setWarmth = (value: number) => color.set('temperature', Math.round(COOLEST - value * (COOLEST - WARMEST)));
</script>

<Section>
	<Row title="Night light" description="Warmer colors in the evening, easier on your eyes">
		<Switch label="Night light" checked={enabled} onchange={(on) => color.set('enabled', on)} />
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
				onchange={(schedule) => color.set('schedule-automatic', schedule === 'automatic')}
			/>
		</Row>
		{#if !automatic}
			<Row title="Turns on">
				<TimePicker label="Turns on" {twelveHour} value={color.values['schedule-from'] ?? 20} onchange={(hours) => color.set('schedule-from', hours)} />
			</Row>
			<Row title="Turns off">
				<TimePicker label="Turns off" {twelveHour} value={color.values['schedule-to'] ?? 6} onchange={(hours) => color.set('schedule-to', hours)} />
			</Row>
		{/if}
		<Row title="Warmth">
			{#snippet below()}
				<Slider label="Warmth" value={warmth} format={percent} oninput={setWarmth} onchange={setWarmth} />
			{/snippet}
		</Row>
	{/if}
</Section>
