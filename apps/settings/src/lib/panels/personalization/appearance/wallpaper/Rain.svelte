<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Segmented, Slider, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';

	type Intensity = 'drizzle' | 'rain' | 'storm';
	type Kestrel = {
		rain: boolean;
		'rain-intensity': Intensity;
		'rain-visible': boolean;
		'rain-sound': boolean;
		'rain-volume': number;
	};

	const kestrel = useSettings<Kestrel>(KESTREL_SCHEMA, ['rain', 'rain-intensity', 'rain-visible', 'rain-sound', 'rain-volume']);

	let raining = $derived(kestrel.values.rain ?? false);
	let sound = $derived(kestrel.values['rain-sound'] ?? false);
	let intensities = $derived<{ value: Intensity; label: string }[]>([
		{ value: 'drizzle', label: t('settings-appearance-rain-drizzle') },
		{ value: 'rain', label: t('settings-appearance-rain-rain') },
		{ value: 'storm', label: t('settings-appearance-rain-storm') }
	]);
</script>

<Row title={t('settings-appearance-rain')} description={t('settings-appearance-rain-description')}>
	<Switch label={t('settings-appearance-rain')} checked={raining} onchange={(on) => kestrel.set('rain', on)} />
</Row>
{#if raining}
	<Row title={t('settings-appearance-rain-intensity')}>
		<Segmented
			label={t('settings-appearance-rain-intensity')}
			options={intensities}
			value={kestrel.values['rain-intensity'] ?? 'rain'}
			onchange={(value) => kestrel.set('rain-intensity', value)}
		/>
	</Row>
	<Row title={t('settings-appearance-rain-visible')} description={t('settings-appearance-rain-visible-description')}>
		<Switch
			label={t('settings-appearance-rain-visible')}
			checked={kestrel.values['rain-visible'] ?? true}
			onchange={(on) => kestrel.set('rain-visible', on)}
		/>
	</Row>
	<Row title={t('settings-appearance-rain-sound')} description={t('settings-appearance-rain-sound-description')}>
		<Switch label={t('settings-appearance-rain-sound')} checked={sound} onchange={(on) => kestrel.set('rain-sound', on)} />
		{#snippet below()}
			{#if sound}
				<Slider
					label={t('settings-appearance-rain-volume')}
					min={0}
					max={1}
					step={0.05}
					value={kestrel.values['rain-volume'] ?? 0.6}
					format={percent}
					onchange={(value) => kestrel.set('rain-volume', value)}
				/>
			{/if}
		{/snippet}
	</Row>
{/if}
