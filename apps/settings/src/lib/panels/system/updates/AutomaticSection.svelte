<script lang="ts">
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { setPreferences, type Preferences, type Schedule } from './api';

	let { preferences = $bindable() }: { preferences: Preferences } = $props();

	const SCHEDULES: { value: Schedule; label: string }[] = [
		{ value: 'daily', label: 'Every day' },
		{ value: 'weekly', label: 'Every week' },
		{ value: 'never', label: 'Only when I check' }
	];

	function change(next: Partial<Preferences>) {
		preferences = { ...preferences, ...next };
		void setPreferences(preferences);
	}
</script>

<Section title="Automatic updates">
	<Row title="Look for updates" description="Even when Settings is closed">
		<Select label="Look for updates" options={SCHEDULES} value={preferences.schedule} onchange={(schedule) => change({ schedule })} />
	</Row>
	<Row title="Download in the background" description="Updates are ready to install the next time you restart">
		<Switch label="Download updates in the background" checked={preferences.download} disabled={preferences.schedule === 'never'} onchange={(download) => change({ download })} />
	</Row>
</Section>
