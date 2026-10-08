<script lang="ts">
	import { SearchField, Section } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { matches } from '../../system/apps/api';
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

<SubPage title="App notifications" back="Notifications" {onclose}>
	{#if apps.length > SEARCH_THRESHOLD}
		<SearchField label="Search apps" bind:value={query} />
	{/if}
	<Section>
		{#each shown as app (app.path)}
			<AppNotifications {app} {lockScreen} {hasRules} />
		{:else}
			<p class="px-4 py-5 text-center text-[13px] text-[var(--text-muted)]">No apps match your search</p>
		{/each}
	</Section>
</SubPage>
