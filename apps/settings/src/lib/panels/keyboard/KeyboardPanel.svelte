<script lang="ts">
	import { Row, Section } from '@luft/ui';
	import InputSources from './InputSources.svelte';
	import RecordDialog from './shortcuts/RecordDialog.svelte';
	import ShortcutsPage from './shortcuts/ShortcutsPage.svelte';
	import { ShortcutStore, type Binding } from './shortcuts/store.svelte';
	import TypingSection from './TypingSection.svelte';

	const store = new ShortcutStore();

	let recording = $state<Binding | null>(null);
	let browsing = $state(false);

	const record = (binding: Binding) => (recording = binding);
</script>

{#if browsing}
	<ShortcutsPage {store} onrecord={record} onclose={() => (browsing = false)} />
{:else}
	<InputSources {store} onrecord={record} />
	<TypingSection />
	<Section>
		<Row title="Keyboard shortcuts" description="See and change shortcuts, or add your own" onclick={() => (browsing = true)} />
	</Section>
{/if}

{#if recording}
	<RecordDialog {store} binding={recording} onclose={() => (recording = null)} />
{/if}
