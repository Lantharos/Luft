<script lang="ts">
	import { untrack } from 'svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import AppIcon from '../apps/AppIcon.svelte';
	import ItemRow from '../apps/ItemRow.svelte';
	import AppNotificationsDialog from './AppNotificationsDialog.svelte';
	import { APP_KEYS, APP_SCHEMA, type AppOptions, type NotifyingApp } from './api';

	interface Props {
		app: NotifyingApp;
		lockScreen: boolean;
	}

	let { app, lockScreen }: Props = $props();

	const options = useSettings<AppOptions>(APP_SCHEMA, APP_KEYS, untrack(() => app.path));

	let open = $state(false);
	let enabled = $derived(options.values.enable ?? true);
	let summary = $derived.by(() => {
		if (!enabled) return 'Off';
		const banners = options.values['show-banners'];
		const locked = lockScreen && options.values['show-in-lock-screen'];
		if (banners && locked) return 'Banners and lock screen';
		if (banners) return 'Banners';
		if (locked) return 'Lock screen';
		return 'Notification list only';
	});
</script>

<ItemRow title={app.name} description={options.loaded ? summary : undefined} onclick={() => (open = true)}>
	{#snippet leading()}
		<AppIcon icon={app.icon} />
	{/snippet}
	<Switch label="Notifications from {app.name}" checked={enabled} onchange={(on) => options.set('enable', on)} />
</ItemRow>

{#if open}
	<AppNotificationsDialog {app} {options} {lockScreen} onclose={() => (open = false)} />
{/if}
