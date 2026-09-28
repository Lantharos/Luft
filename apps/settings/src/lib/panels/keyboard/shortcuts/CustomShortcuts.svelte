<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import CustomDialog from './CustomDialog.svelte';
	import Keys from './Keys.svelte';
	import type { CustomBinding, ShortcutStore } from './store.svelte';

	let { store }: { store: ShortcutStore } = $props();

	let editing = $state<CustomBinding | 'new' | null>(null);
</script>

<Section title="Custom shortcuts" description="Run a command or open an app with a key combination">
	{#each store.custom as binding (binding.id)}
		<Row title={binding.name || 'Untitled'} description={binding.command} onclick={() => (editing = binding)}>
			<Keys accelerators={binding.accelerators} />
		</Row>
	{/each}
	<div class="p-2">
		<button type="button" class="plain-button" onclick={() => (editing = 'new')}>
			<Plus size={16} />
			Add shortcut
		</button>
	</div>
</Section>

{#if editing}
	<CustomDialog {store} binding={editing === 'new' ? null : editing} onclose={() => (editing = null)} />
{/if}
