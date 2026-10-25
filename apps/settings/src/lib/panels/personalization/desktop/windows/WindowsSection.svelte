<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';

	const windows = useSettings<{ 'rounded-window-corners': boolean }>(KESTREL_SCHEMA, ['rounded-window-corners']);

	let rounded = $derived(windows.values['rounded-window-corners'] ?? true);
</script>

<Section title={t('settings-windows-title')}>
	<Row title={t('settings-windows-rounded-corners')} description={t('settings-windows-rounded-corners-description')}>
		<Switch label={t('settings-windows-rounded-corners')} checked={rounded} onchange={(on) => windows.set('rounded-window-corners', on)} />
	</Row>
</Section>
