<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import { app } from '#lib/state/app.svelte.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';
	import CopilotKeySection from './CopilotKeySection.svelte';
	import DictationPage from './dictation/DictationPage.svelte';
	import InputSources from './InputSources.svelte';
	import RecordDialog from './shortcuts/RecordDialog.svelte';
	import ShortcutsPage from './shortcuts/ShortcutsPage.svelte';
	import { ShortcutStore, type Binding } from './shortcuts/store.svelte';
	import TypingSection from './TypingSection.svelte';

	const store = new ShortcutStore();

	let recording = $state<Binding | null>(null);
	let browsing = $state(false);

	const dictation = useSettings<{ enabled: boolean }>('com.lantharos.kestrel.dictation', ['enabled']);

	const record = (binding: Binding) => (recording = binding);
</script>

{#if app.section === 'dictation'}
	<DictationPage {store} onrecord={record} onclose={() => (app.section = null)} />
{:else if browsing}
	<ShortcutsPage {store} onrecord={record} onclose={() => (browsing = false)} />
{:else}
	<InputSources {store} onrecord={record} />
	<TypingSection />
	{#if hardware.present?.copilotKey}
		<CopilotKeySection />
	{/if}
	<Section>
		<Row title="Dictation" description={dictation.values.enabled ? 'On' : 'Off'} onclick={() => (app.section = 'dictation')} />
		<Row title="Keyboard shortcuts" description="See and change shortcuts, or add your own" onclick={() => (browsing = true)} />
	</Section>
{/if}

{#if recording}
	<RecordDialog {store} binding={recording} onclose={() => (recording = null)} />
{/if}
