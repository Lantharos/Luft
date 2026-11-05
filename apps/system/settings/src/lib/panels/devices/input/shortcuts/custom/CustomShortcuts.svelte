<script lang="ts">
	import { t } from '@luft/i18n';
	import Plus from '@lucide/svelte/icons/plus';
	import { item, reorder, Row, Section } from '@luft/ui';
	import CustomDialog from './CustomDialog.svelte';
	import Keys from '../keys/Keys.svelte';
	import type { CustomBinding, ShortcutStore } from '../store.svelte';

	let { store }: { store: ShortcutStore } = $props();

	let editing = $state<CustomBinding | 'new' | null>(null);
</script>

<Section title={t('settings-shortcuts-custom')} description={t('settings-shortcuts-custom-description')}>
	{#each store.custom as binding (binding.id)}
		<div class="row-slot" animate:reorder in:item out:item>
			<Row title={binding.name || t('settings-shortcuts-untitled')} description={binding.command} truncate onclick={() => (editing = binding)}>
				<Keys accelerators={binding.accelerators} />
			</Row>
		</div>
	{/each}
	<div class="p-2">
		<button type="button" class="plain-button" onclick={() => (editing = 'new')}>
			<Plus size={16} />
			{t('settings-shortcuts-add')}
		</button>
	</div>
</Section>

{#if editing}
	<CustomDialog {store} binding={editing === 'new' ? null : editing} onclose={() => (editing = null)} />
{/if}
