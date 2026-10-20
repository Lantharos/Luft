<script lang="ts">
	import { t } from '@luft/i18n';
	import { Row, Section, Switch } from '@luft/ui';
	import { schemaInstalled, useSettings } from '#lib/state/gsettings.svelte.js';
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
		<Row title={t('settings-notifications-dnd')} description={t('settings-notifications-dnd-description')}>
			<Switch label={t('settings-notifications-dnd')} checked={!(general.values['show-banners'] ?? true)} onchange={(on) => general.set('show-banners', !on)} />
		</Row>
	</Section>

	<Section title={t('settings-notifications-lock-screen')}>
		<Row title={t('settings-notifications-show-lock-screen')}>
			<Switch label={t('settings-notifications-show-lock-screen')} checked={lockScreen} onchange={(on) => general.set('show-in-lock-screen', on)} />
		</Row>
		{#if hasMessageContent}
			<MessageContent {lockScreen} />
		{/if}
	</Section>

	{#if apps.length && hasRules !== null}
		<Section>
			<Row title={t('settings-notifications-apps')} description={t('settings-notifications-apps-description')} onclick={() => (browsing = true)} />
		</Section>
	{/if}
{/if}
