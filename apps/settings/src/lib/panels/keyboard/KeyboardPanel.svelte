<script lang="ts">
	import InputSources from './InputSources.svelte';
	import CustomShortcuts from './shortcuts/CustomShortcuts.svelte';
	import RecordDialog from './shortcuts/RecordDialog.svelte';
	import ShortcutsSection from './shortcuts/ShortcutsSection.svelte';
	import { ShortcutStore, type Binding } from './shortcuts/store.svelte';
	import TypingSection from './TypingSection.svelte';

	const store = new ShortcutStore();

	let recording = $state<Binding | null>(null);

	const record = (binding: Binding) => (recording = binding);
</script>

<InputSources {store} onrecord={record} />
<TypingSection />
<ShortcutsSection {store} onrecord={record} />
<CustomShortcuts {store} />

{#if recording}
	<RecordDialog {store} binding={recording} onclose={() => (recording = null)} />
{/if}
