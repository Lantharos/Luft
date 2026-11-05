<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Segmented, Select, Switch } from '@luft/ui';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import { START_STYLES, WEB_SEARCH, type TaskbarSettings } from './options';

	interface Props {
		settings: SettingsGroup<TaskbarSettings>;
	}

	let { settings }: Props = $props();

	let style = $derived(settings.values['start-style'] ?? 'menu');
	let styles = $derived(START_STYLES.map((option) => ({ value: option.value, label: t(option.label) })));
</script>

<Section>
	<Row title={t('settings-start-style')} description={t(style === 'palette' ? 'settings-start-style-palette-description' : 'settings-start-style-menu-description')}>
		<Segmented label={t('settings-start-style')} options={styles} value={style} onchange={(value) => settings.set('start-style', value)} />
	</Row>
	<Row title={t('settings-start-button')} description={t('settings-start-button-description')}>
		<Switch label={t('settings-start-button')} checked={settings.values['taskbar-start-button'] ?? true} onchange={(on) => settings.set('taskbar-start-button', on)} />
	</Row>
	<Row title={t('settings-start-web')}>
		<Select label={t('settings-start-web')} options={WEB_SEARCH} value={settings.values['search-web-engine'] ?? 'duckduckgo'} onchange={(value) => settings.set('search-web-engine', value)} />
	</Row>
</Section>
