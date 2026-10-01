<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import SubPage from '$lib/components/SubPage.svelte';
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
		<label class="search">
			<Search size={16} class="shrink-0 text-[var(--text-muted)]" />
			<input bind:value={query} placeholder="Search shortcuts" aria-label="Search shortcuts" />
		</label>
	{/snippet}
	<ShortcutsSection {store} {onrecord} {query} />
	<CustomShortcuts {store} />
</SubPage>

<style>
	.search {
		display: flex;
		height: 36px;
		width: 260px;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		padding-inline: 14px;
		transition: box-shadow 160ms var(--ease);
	}

	.search:focus-within {
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	input {
		min-width: 0;
		flex: 1;
		background: transparent;
		font-size: 13.5px;
		outline: none;
	}

	input::placeholder {
		color: var(--text-muted);
	}
</style>
