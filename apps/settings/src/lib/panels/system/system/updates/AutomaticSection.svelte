<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { setPreferences, type Preferences, type Schedule } from './api';

	let { preferences = $bindable() }: { preferences: Preferences } = $props();

	let schedules = $derived<{ value: Schedule; label: string }[]>([
		{ value: 'daily', label: t('settings-updates-schedule-daily') },
		{ value: 'weekly', label: t('settings-updates-schedule-weekly') },
		{ value: 'never', label: t('settings-updates-schedule-never') }
	]);

	function change(next: Partial<Preferences>) {
		preferences = { ...preferences, ...next };
		void setPreferences(preferences);
	}
</script>

<Section title={t('settings-updates-automatic')}>
	<Row title={t('settings-updates-look')} description={t('settings-updates-look-description')}>
		<Select label={t('settings-updates-look')} options={schedules} value={preferences.schedule} onchange={(schedule) => change({ schedule })} />
	</Row>
	<Row title={t('settings-updates-background')} description={t('settings-updates-background-description')}>
		<Switch label={t('settings-updates-background-label')} checked={preferences.download} disabled={preferences.schedule === 'never'} onchange={(download) => change({ download })} />
	</Row>
</Section>
