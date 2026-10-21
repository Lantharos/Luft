<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import DictationPage from './dictation/DictationPage.svelte';
	import CopilotKeySection from './keyboard/CopilotKeySection.svelte';
	import InputSources from './keyboard/InputSources.svelte';
	import OwnLayouts from './keyboard/OwnLayouts.svelte';
	import TypingSection from './keyboard/TypingSection.svelte';
	import MouseSection from './pointing/MouseSection.svelte';
	import TouchpadSection from './pointing/TouchpadSection.svelte';
	import RecordDialog from './shortcuts/RecordDialog.svelte';
	import ShortcutsPage from './shortcuts/ShortcutsPage.svelte';
	import { ShortcutStore, type Binding } from './shortcuts/store.svelte';

	const store = new ShortcutStore();

	let recording = $state<Binding | null>(null);

	const dictation = useSettings<{ enabled: boolean }>('com.lantharos.kestrel.dictation', ['enabled']);

	const record = (binding: Binding) => (recording = binding);
	const close = () => (app.section = null);
</script>

{#if app.section === 'dictation'}
	<DictationPage {store} onrecord={record} onclose={close} />
{:else if app.section === 'shortcuts'}
	<ShortcutsPage {store} onrecord={record} onclose={close} />
{:else}
	<InputSources {store} onrecord={record} />
	<Section>
		<Row title={t('settings-shortcuts-title')} description={t('settings-keyboard-shortcuts-description')} onclick={() => (app.section = 'shortcuts')} />
		<Row title={t('settings-dictation-title')} description={dictation.values.enabled ? t('settings-keyboard-dictation-on') : t('settings-keyboard-dictation-off')} onclick={() => (app.section = 'dictation')} />
	</Section>
	{#if hardware.present?.mouse}
		<MouseSection />
	{/if}
	{#if hardware.present?.touchpad}
		<TouchpadSection />
	{/if}
	<TypingSection />
	{#if hardware.present?.copilotKey}
		<CopilotKeySection />
	{/if}
	<OwnLayouts />
{/if}

{#if recording}
	<RecordDialog {store} binding={recording} onclose={() => (recording = null)} />
{/if}
