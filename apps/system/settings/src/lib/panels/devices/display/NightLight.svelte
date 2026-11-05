<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Slider, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import TimePicker from '#lib/components/TimePicker.svelte';

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
	<Row title={t('settings-display-night-light')} description={t('settings-display-night-light-description')}>
		<Switch label={t('settings-display-night-light')} checked={enabled} onchange={(on) => color.set('enabled', on)} />
	</Row>
	{#if enabled}
		<Row title={t('settings-display-night-light-schedule')}>
			<Segmented
				label={t('settings-display-night-light-schedule')}
				options={[
					{ value: 'automatic', label: t('settings-display-night-light-automatic') },
					{ value: 'custom', label: t('settings-display-night-light-custom') }
				]}
				value={automatic ? 'automatic' : 'custom'}
				onchange={(schedule) => color.set('schedule-automatic', schedule === 'automatic')}
			/>
		</Row>
		{#if !automatic}
			<Row title={t('settings-display-night-light-from')}>
				<TimePicker label={t('settings-display-night-light-from')} {twelveHour} value={color.values['schedule-from'] ?? 20} onchange={(hours) => color.set('schedule-from', hours)} />
			</Row>
			<Row title={t('settings-display-night-light-to')}>
				<TimePicker label={t('settings-display-night-light-to')} {twelveHour} value={color.values['schedule-to'] ?? 6} onchange={(hours) => color.set('schedule-to', hours)} />
			</Row>
		{/if}
		<Row title={t('settings-display-night-light-warmth')}>
			{#snippet below()}
				<Slider label={t('settings-display-night-light-warmth')} value={warmth} format={percent} oninput={setWarmth} onchange={setWarmth} />
			{/snippet}
		</Row>
	{/if}
</Section>
