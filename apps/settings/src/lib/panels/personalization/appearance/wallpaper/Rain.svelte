<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Segmented, Switch } from '@luft/ui';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';

	type Intensity = 'drizzle' | 'rain' | 'storm';

	const kestrel = useSettings<{ rain: boolean; 'rain-intensity': Intensity }>(KESTREL_SCHEMA, ['rain', 'rain-intensity']);

	let raining = $derived(kestrel.values.rain ?? false);
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
{/if}
