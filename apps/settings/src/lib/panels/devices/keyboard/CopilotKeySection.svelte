<script lang="ts">
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import ChooseAppDialog from '../../system/apps/ChooseAppDialog.svelte';
	import { installedApps, type App } from '../../system/apps/api';

	type Press = 'search' | 'app' | 'nothing';
	type CopilotKey = { press: Press; app: string; hold: boolean };

	const PRESSES: { value: Press; label: string }[] = [
		{ value: 'search', label: 'Open Start' },
		{ value: 'app', label: 'Open an app' },
		{ value: 'nothing', label: 'Nothing' }
	];

	const key = useSettings<CopilotKey>('com.lantharos.kestrel.copilot-key', ['press', 'app', 'hold']);
	const dictation = useSettings<{ enabled: boolean }>('com.lantharos.kestrel.dictation', ['enabled']);

	let apps = $state<App[]>([]);
	let choosing = $state(false);

	let press = $derived(key.values.press ?? 'search');
	let chosen = $derived(apps.find((app) => app.id === key.values.app));

	void installedApps().then((list) => (apps = list));

	async function pick(value: Press) {
		await key.set('press', value);
		if (value === 'app' && !chosen) choosing = true;
	}

	async function choose(id: string) {
		choosing = false;
		await key.set('app', id);
	}
</script>

<Section title="Copilot key">
	<Row title="Press" description="What a quick press of the key does">
		<Select label="Press" options={PRESSES} value={press} onchange={pick} />
	</Row>
	{#if press === 'app'}
		<Row title="App" description={chosen?.name ?? 'No app chosen yet'}>
			<button type="button" class="button" onclick={() => (choosing = true)}>{chosen ? 'Change' : 'Choose'}</button>
		</Row>
	{/if}
	<Row
		title="Hold to dictate"
		description={dictation.values.enabled ? 'Hold the key and talk to type what you say' : 'Works once dictation is on'}
	>
		<Switch label="Hold to dictate" checked={key.values.hold ?? true} onchange={(on) => key.set('hold', on)} />
	</Row>
</Section>

{#if choosing}
	<ChooseAppDialog title="Choose an app" description="Pressing the Copilot key opens it." onchoose={choose} onclose={() => (choosing = false)} />
{/if}
