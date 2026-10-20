<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Select, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import ChooseAppDialog from '../../system/apps/ChooseAppDialog.svelte';
	import { installedApps, type App } from '../../system/apps/api';

	type Press = 'search' | 'app' | 'nothing';
	type CopilotKey = { press: Press; app: string; hold: boolean };

	const PRESSES: { value: Press; label: string }[] = [
		{ value: 'search', label: 'settings-keyboard-copilot-open-start' },
		{ value: 'app', label: 'settings-keyboard-copilot-open-app' },
		{ value: 'nothing', label: 'settings-keyboard-copilot-nothing' }
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

<Section title={t('settings-keyboard-copilot')}>
	<Row title={t('settings-keyboard-copilot-press')} description={t('settings-keyboard-copilot-press-description')}>
		<Select label={t('settings-keyboard-copilot-press')} options={PRESSES.map((option) => ({ ...option, label: t(option.label) }))} value={press} onchange={pick} />
	</Row>
	{#if press === 'app'}
		<Row title={t('settings-keyboard-copilot-app')} description={chosen?.name ?? t('settings-keyboard-copilot-no-app')}>
			<button type="button" class="button" onclick={() => (choosing = true)}>{chosen ? t('settings-keyboard-copilot-change') : t('settings-keyboard-copilot-choose')}</button>
		</Row>
	{/if}
	<Row
		title={t('settings-keyboard-copilot-hold')}
		description={dictation.values.enabled ? t('settings-keyboard-copilot-hold-description') : t('settings-keyboard-copilot-hold-off')}
	>
		<Switch label={t('settings-keyboard-copilot-hold')} checked={key.values.hold ?? true} onchange={(on) => key.set('hold', on)} />
	</Row>
</Section>

{#if choosing}
	<ChooseAppDialog title={t('settings-keyboard-copilot-choose-app')} description={t('settings-keyboard-copilot-choose-app-description')} onchoose={choose} onclose={() => (choosing = false)} />
{/if}
