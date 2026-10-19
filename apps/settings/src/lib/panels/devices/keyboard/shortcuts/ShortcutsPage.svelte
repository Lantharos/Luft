<script lang="ts">
	import { SearchField } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import CustomShortcuts from './CustomShortcuts.svelte';
	import ShortcutsSection from './ShortcutsSection.svelte';
	import type { Binding, ShortcutStore } from './store.svelte';

	interface Props {
		store: ShortcutStore;
		onrecord: (binding: Binding) => void;
		onclose: () => void;
	}

	let { store, onrecord, onclose }: Props = $props();

	let query = $state('');
</script>

<SubPage title="Keyboard shortcuts" back="Keyboard" {onclose}>
	{#snippet actions()}
		<div class="w-[260px]">
			<SearchField label="Search shortcuts" bind:value={query} />
		</div>
	{/snippet}
	<ShortcutsSection {store} {onrecord} {query} />
	<CustomShortcuts {store} />
</SubPage>

