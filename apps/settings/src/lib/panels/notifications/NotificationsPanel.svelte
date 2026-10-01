<script lang="ts">
	import { Row, Section, Switch } from '@luft/ui';
	import { schemaInstalled, useSettings } from '$lib/state/gsettings.svelte';
	import AppsPage from './AppsPage.svelte';
	import MessageContent from './MessageContent.svelte';
	import { KESTREL_SCHEMA, RULES_SCHEMA, notifyingApps, type NotifyingApp } from './api';

	type General = {
		'show-banners': boolean;
		'show-in-lock-screen': boolean;
		'application-children': string[];
	};

	const general = useSettings<General>('org.gnome.desktop.notifications', ['show-banners', 'show-in-lock-screen', 'application-children']);

	let hasMessageContent = $state(false);
	let hasRules = $state<boolean | null>(null);
	let apps = $state<NotifyingApp[]>([]);
	let browsing = $state(false);

	let lockScreen = $derived(general.values['show-in-lock-screen'] ?? true);

	$effect(() => {
		if (general.values['application-children']) void notifyingApps().then((list) => (apps = list));
	});

	void schemaInstalled(KESTREL_SCHEMA).then((installed) => (hasMessageContent = installed));
	void schemaInstalled(RULES_SCHEMA).then((installed) => (hasRules = installed));
</script>

{#if browsing && hasRules !== null}
	<AppsPage {apps} {lockScreen} {hasRules} onclose={() => (browsing = false)} />
{:else}
	<Section>
		<Row title="Do not disturb" description="Banners and sounds stay off, except for apps you allow">
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

	{#if apps.length && hasRules !== null}
		<Section>
			<Row title="App notifications" description="Choose how each app notifies you" onclick={() => (browsing = true)} />
		</Section>
	{/if}
{/if}
