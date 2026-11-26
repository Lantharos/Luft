<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import { GUST_LOOKS, WEB_SEARCH, type TaskbarSettings } from './options';

	interface Props {
		settings: SettingsGroup<TaskbarSettings>;
	}

	let { settings }: Props = $props();

	let look = $derived(settings.values['gust-look'] ?? 'panel');
	let looks = $derived(GUST_LOOKS.map((option) => ({ value: option.value, label: t(option.label) })));
</script>

<Section>
	<Row title={t('settings-gust-look')} description={t(look === 'palette' ? 'settings-gust-look-grid-description' : 'settings-gust-look-pinned-description')}>
		<Segmented label={t('settings-gust-look')} options={looks} value={look} onchange={(value) => settings.set('gust-look', value)} />
	</Row>
	<Row title={t('settings-gust-pin-new-apps')} description={t('settings-gust-pin-new-apps-description')}>
		<Switch label={t('settings-gust-pin-new-apps')} checked={settings.values['gust-pin-new-apps'] ?? true} onchange={(on) => settings.set('gust-pin-new-apps', on)} />
	</Row>
	<Row title={t('settings-gust-button')} description={t('settings-gust-button-description')}>
		<Switch label={t('settings-gust-button')} checked={settings.values['taskbar-gust-button'] ?? true} onchange={(on) => settings.set('taskbar-gust-button', on)} />
	</Row>
	<Row title={t('settings-gust-web')}>
		<Select label={t('settings-gust-web')} options={WEB_SEARCH} value={settings.values['search-web-engine'] ?? 'duckduckgo'} onchange={(value) => settings.set('search-web-engine', value)} />
	</Row>
</Section>
