<script lang="ts">
	import { t } from '@luft/i18n';
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

<SubPage title={t('settings-shortcuts-title')} back={t('settings-page-keyboard')} {onclose}>
	{#snippet actions()}
		<div class="w-[260px]">
			<SearchField label={t('settings-shortcuts-search')} bind:value={query} />
		</div>
	{/snippet}
	<ShortcutsSection {store} {onrecord} {query} />
	<CustomShortcuts {store} />
</SubPage>

