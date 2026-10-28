<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { Schedule, UpdatePolicy } from '#lib/bindings.js';

	let { preferences = $bindable() }: { preferences: UpdatePolicy } = $props();

	let schedules = $derived<{ value: Schedule; label: string }[]>([
		{ value: 'daily', label: t('settings-updates-schedule-daily') },
		{ value: 'weekly', label: t('settings-updates-schedule-weekly') },
		{ value: 'never', label: t('settings-updates-schedule-never') }
	]);

	async function change(next: Partial<UpdatePolicy>) {
		const previous = preferences;
		preferences = { ...preferences, ...next };
		await commands.updatesSetPreferences(preferences).catch(() => (preferences = previous));
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
