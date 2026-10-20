<script lang="ts">
	import { t } from '@luft/i18n';
	import SubPage from '#lib/components/SubPage.svelte';
	import type { Access } from '../api';
	import AppsSection from './AppsSection.svelte';
	import HistorySection from './HistorySection.svelte';
	import StoresSection from './StoresSection.svelte';

	interface Props {
		access: Access;
		refresh: () => Promise<void>;
		onclose: () => void;
	}

	let { access, refresh, onclose }: Props = $props();
</script>

<SubPage title={t('settings-passwords-apps')} back={t('settings-passwords-access-back')} {onclose}>
	<AppsSection apps={access.apps} {refresh} />

	{#if access.stores.length}
		<StoresSection stores={access.stores} {refresh} />
	{/if}

	{#if access.history.length}
		<HistorySection history={access.history} {refresh} />
	{/if}
</SubPage>
