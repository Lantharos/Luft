<script lang="ts">
	import { Dialog, Row, Select, Switch } from '@luft/ui';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import type { AppOptions, AppRules, DoNotDisturb, NotifyingApp } from './api';

	interface Props {
		app: NotifyingApp;
		options: SettingsGroup<AppOptions>;
		rules: SettingsGroup<AppRules> | null;
		lockScreen: boolean;
		onclose: () => void;
	}

	const DO_NOT_DISTURB: { value: DoNotDisturb; label: string }[] = [
		{ value: 'never', label: 'Never' },
		{ value: 'urgent', label: 'Urgent only' },
		{ value: 'always', label: 'Always' }
	];

	let { app, options, rules, lockScreen, onclose }: Props = $props();

	let off = $derived(!(options.values.enable ?? true));
	let hiddenOnLockScreen = $derived(off || !lockScreen || !options.values['show-in-lock-screen']);
</script>

{#snippet toggle(key: keyof AppOptions, label: string, disabled: boolean)}
	<Switch {label} {disabled} checked={options.values[key] ?? true} onchange={(on) => options.set(key, on)} />
{/snippet}

<Dialog title={app.name} {onclose}>
	<div class="row-group">
		<Row title="Allow notifications">
			{@render toggle('enable', 'Allow notifications', false)}
		</Row>
		<Row title="Banners" description="Pop up on screen when they arrive" disabled={off}>
			{@render toggle('show-banners', 'Banners', off)}
		</Row>
		<Row title="Sound" disabled={off}>
			{@render toggle('enable-sound-alerts', 'Sound', off)}
		</Row>
		{#if rules}
			<Row title="Allow during Do Not Disturb" description="Urgent means alarms and calls" disabled={off}>
				<Select
					label="Allow during Do Not Disturb"
					options={DO_NOT_DISTURB}
					value={rules.values['during-do-not-disturb'] ?? 'urgent'}
					disabled={off}
					onchange={(value) => rules.set('during-do-not-disturb', value)}
				/>
			</Row>
			<Row title="Keep in the notification list" description="Otherwise they go once their banner closes" disabled={off}>
				<Switch
					label="Keep in the notification list"
					disabled={off}
					checked={rules.values['keep-in-list'] ?? true}
					onchange={(on) => rules.set('keep-in-list', on)}
				/>
			</Row>
		{/if}
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
