<script lang="ts">
	import { t } from '@luft/i18n';
	import { SearchField, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { matches } from '../../protection/apps/api';
	import AppNotifications from './AppNotifications.svelte';
	import type { NotifyingApp } from './api';

	interface Props {
		apps: NotifyingApp[];
		lockScreen: boolean;
		hasRules: boolean;
		onclose: () => void;
	}

	const SEARCH_THRESHOLD = 8;

	let { apps, lockScreen, hasRules, onclose }: Props = $props();

	let query = $state('');

	let shown = $derived(apps.filter((app) => matches(app, query)));
</script>

<SubPage title={t('settings-notifications-apps')} back={t('settings-notifications-back')} {onclose}>
	{#if apps.length > SEARCH_THRESHOLD}
		<SearchField label={t('settings-notifications-search')} bind:value={query} />
	{/if}
	<Section>
		{#each shown as app (app.path)}
			<AppNotifications {app} {lockScreen} {hasRules} />
		{:else}
			<p class="px-4 py-5 text-center text-[13px] text-[var(--text-muted)]">{t('settings-notifications-no-match')}</p>
		{/each}
	</Section>
</SubPage>
