<script lang="ts">
	import { t } from '@luft/i18n';
	import { untrack } from 'svelte';
	import { AppIcon, ItemRow, Switch } from '@luft/ui';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import AppNotificationsDialog from './AppNotificationsDialog.svelte';
	import { APP_KEYS, APP_SCHEMA, RULES_KEYS, RULES_SCHEMA, type AppOptions, type AppRules, type NotifyingApp } from './api';

	interface Props {
		app: NotifyingApp;
		lockScreen: boolean;
	}

	let { app, lockScreen }: Props = $props();

	const options = useSettings<AppOptions>(APP_SCHEMA, APP_KEYS, untrack(() => app.path));
	const rules = useSettings<AppRules>(RULES_SCHEMA, RULES_KEYS, untrack(() => app.rulesPath));

	let open = $state(false);
	let enabled = $derived(options.values.enable ?? true);
	let summary = $derived.by(() => {
		if (!enabled) return undefined;
		const banners = options.values['show-banners'];
		const locked = lockScreen && options.values['show-in-lock-screen'];
		if (banners && locked) return t('settings-notifications-summary-both');
		if (banners) return t('settings-notifications-summary-banners');
		if (locked) return t('settings-notifications-summary-lock-screen');
		return t('settings-notifications-summary-list');
	});
</script>

<ItemRow title={app.name} description={options.loaded ? summary : undefined} onclick={() => (open = true)}>
	{#snippet leading()}
		<AppIcon icon={app.icon} id={app.id} />
	{/snippet}
	<Switch label={t('settings-notifications-from', { app: app.name })} checked={enabled} onchange={(on) => options.set('enable', on)} />
</ItemRow>

{#if open}
	<AppNotificationsDialog {app} {options} {rules} {lockScreen} onclose={() => (open = false)} />
{/if}
