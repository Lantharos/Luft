<script lang="ts">
	import Row from '$lib/components/controls/Row.svelte';
	import Section from '$lib/components/controls/Section.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { schemaInstalled, useSettings } from '$lib/state/gsettings.svelte';
	import SearchField from '../apps/SearchField.svelte';
	import { matches } from '../apps/api';
	import AppNotifications from './AppNotifications.svelte';
	import MessageContent from './MessageContent.svelte';
	import { KESTREL_SCHEMA, notifyingApps, type NotifyingApp } from './api';

	type General = {
		'show-banners': boolean;
		'show-in-lock-screen': boolean;
		'application-children': string[];
	};

	const SEARCH_THRESHOLD = 8;

	const general = useSettings<General>('org.gnome.desktop.notifications', ['show-banners', 'show-in-lock-screen', 'application-children']);

	let hasMessageContent = $state(false);
	let apps = $state<NotifyingApp[]>([]);
	let query = $state('');

	let lockScreen = $derived(general.values['show-in-lock-screen'] ?? true);
	let shown = $derived(apps.filter((app) => matches(app, query)));

	$effect(() => {
		if (general.values['application-children']) void notifyingApps().then((list) => (apps = list));
	});

	void schemaInstalled(KESTREL_SCHEMA).then((installed) => (hasMessageContent = installed));
</script>

<Section>
	<Row title="Do not disturb" description="Banners stay hidden. Notifications still wait for you in the list.">
		<Switch label="Do not disturb" checked={!(general.values['show-banners'] ?? true)} onchange={(on) => general.set('show-banners', !on)} />
	</Row>
</Section>

<Section title="Lock screen">
	<Row title="Show notifications on the lock screen">
		<Switch label="Show notifications on the lock screen" checked={lockScreen} onchange={(on) => general.set('show-in-lock-screen', on)} />
	</Row>
	{#if hasMessageContent}
		<MessageContent {lockScreen} />
	{/if}
</Section>

{#if apps.length}
	<Section title="Apps">
		{#if apps.length > SEARCH_THRESHOLD}
			<div class="p-3">
				<SearchField label="Search apps" bind:value={query} />
			</div>
		{/if}
		{#each shown as app (app.path)}
			<AppNotifications {app} {lockScreen} />
		{:else}
			<p class="px-4 py-5 text-center text-[13px] text-[var(--text-muted)]">No apps match your search</p>
		{/each}
	</Section>
{/if}
