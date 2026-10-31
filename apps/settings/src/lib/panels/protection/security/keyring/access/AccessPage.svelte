<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section } from '@luft/ui';
	import type { Access } from '#lib/bindings.js';
	import SubPage from '#lib/components/SubPage.svelte';
	import { app } from '#lib/state/app.svelte.js';
	import HistorySection from './HistorySection.svelte';
	import StoresSection from './StoresSection.svelte';

	interface Props {
		access: Access;
		refresh: () => Promise<void>;
		onclose: () => void;
	}

	let { access, refresh, onclose }: Props = $props();
</script>

<SubPage title={t('settings-passwords-apps')} {onclose}>
	<Section>
		<Row title={t('settings-passwords-apps-allowed')} description={t('settings-passwords-apps-allowed-hint')} onclick={() => app.open('apps')} />
	</Section>

	{#if access.stores.length}
		<StoresSection stores={access.stores} {refresh} />
	{/if}

	{#if access.history.length}
		<HistorySection history={access.history} {refresh} />
	{/if}
</SubPage>
