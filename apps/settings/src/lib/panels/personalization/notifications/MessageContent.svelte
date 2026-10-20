<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { KESTREL_SCHEMA } from './api';

	interface Props {
		lockScreen: boolean;
	}

	let { lockScreen }: Props = $props();

	const kestrel = useSettings<{ 'lock-screen-content': boolean }>(KESTREL_SCHEMA, ['lock-screen-content']);
</script>

<Row title={t('settings-notifications-content')} description={t('settings-notifications-content-description')} disabled={!lockScreen}>
	<Switch
		label={t('settings-notifications-content-lock-screen')}
		disabled={!lockScreen}
		checked={kestrel.values['lock-screen-content'] ?? true}
		onchange={(on) => kestrel.set('lock-screen-content', on)}
	/>
</Row>
