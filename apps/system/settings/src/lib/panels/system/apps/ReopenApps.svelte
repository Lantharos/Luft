<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { KESTREL_SCHEMA, useSettings } from '#lib/state/gsettings.svelte.js';

	const session = useSettings<{ 'reopen-apps': boolean }>(KESTREL_SCHEMA, ['reopen-apps']);
</script>

<Section>
	<Row title={t('settings-apps-reopen')} description={t('settings-apps-reopen-description')}>
		<Switch label={t('settings-apps-reopen')} checked={session.values['reopen-apps'] ?? false} onchange={(on) => session.set('reopen-apps', on)} />
	</Row>
</Section>
