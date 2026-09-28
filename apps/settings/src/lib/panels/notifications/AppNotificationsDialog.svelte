<script lang="ts">
	import Dialog from '$lib/components/controls/Dialog.svelte';
	import Row from '$lib/components/controls/Row.svelte';
	import Switch from '$lib/components/controls/Switch.svelte';
	import type { SettingsGroup } from '$lib/state/gsettings.svelte';
	import type { AppOptions, NotifyingApp } from './api';

	interface Props {
		app: NotifyingApp;
		options: SettingsGroup<AppOptions>;
		lockScreen: boolean;
		onclose: () => void;
	}

	let { app, options, lockScreen, onclose }: Props = $props();

	let off = $derived(!(options.values.enable ?? true));
	let hiddenOnLockScreen = $derived(off || !lockScreen || !options.values['show-in-lock-screen']);
</script>

{#snippet toggle(key: keyof AppOptions, label: string, disabled: boolean)}
	<Switch {label} {disabled} checked={options.values[key] ?? true} onchange={(on) => options.set(key, on)} />
{/snippet}

<Dialog title={app.name} description={off ? 'Notifications from this app are turned off.' : undefined} {onclose}>
	<div class="group">
		<Row title="Allow notifications">
			{@render toggle('enable', 'Allow notifications', false)}
		</Row>
		<Row title="Banners" description="Pop up on screen when they arrive" disabled={off}>
			{@render toggle('show-banners', 'Banners', off)}
		</Row>
		<Row title="Sound" disabled={off}>
			{@render toggle('enable-sound-alerts', 'Sound', off)}
		</Row>
		<Row title="Show on the lock screen" disabled={off || !lockScreen}>
			{@render toggle('show-in-lock-screen', 'Show on the lock screen', off || !lockScreen)}
		</Row>
		<Row title="Show message content on the lock screen" disabled={hiddenOnLockScreen}>
			{@render toggle('details-in-lock-screen', 'Show message content on the lock screen', hiddenOnLockScreen)}
		</Row>
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>Done</button>
	{/snippet}
</Dialog>
