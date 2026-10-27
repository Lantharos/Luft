<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';

	const kestrel = useSettings<{ 'live-wallpaper-on-battery': boolean }>(KESTREL_SCHEMA, ['live-wallpaper-on-battery']);

	let hasBattery = $state(false);

	void commands.powerState().then((state) => (hasBattery = !!state.battery));
</script>

{#if hasBattery}
	<Row title={t('settings-appearance-wallpaper-battery')} description={t('settings-appearance-wallpaper-battery-description')}>
		<Switch
			label={t('settings-appearance-wallpaper-battery')}
			checked={kestrel.values['live-wallpaper-on-battery'] ?? false}
			onchange={(on) => kestrel.set('live-wallpaper-on-battery', on)}
		/>
	</Row>
{/if}
