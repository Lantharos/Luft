<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, Row, Select, Switch } from '@luft/ui';
	import type { NotifyingApp } from '#lib/bindings.js';
	import type { SettingsGroup } from '#lib/state/gsettings.svelte.js';
	import type { AppOptions, AppRules, DoNotDisturb, Sound } from './api';

	interface Props {
		app: NotifyingApp;
		options: SettingsGroup<AppOptions>;
		rules: SettingsGroup<AppRules>;
		lockScreen: boolean;
		onclose: () => void;
	}

	let { app, options, rules, lockScreen, onclose }: Props = $props();

	let doNotDisturb = $derived<{ value: DoNotDisturb; label: string }[]>([
		{ value: 'never', label: t('settings-notifications-dnd-never') },
		{ value: 'urgent', label: t('settings-notifications-dnd-urgent') },
		{ value: 'always', label: t('settings-notifications-dnd-always') }
	]);
	let sounds = $derived<{ value: Sound; label: string }[]>([
		{ value: 'automatic', label: t('settings-notifications-sound-automatic') },
		{ value: 'luft', label: t('settings-notifications-sound-luft') },
		{ value: 'app', label: t('settings-notifications-sound-app') },
		{ value: 'none', label: t('settings-notifications-sound-none') }
	]);
	let off = $derived(!(options.values.enable ?? true));
	let hiddenOnLockScreen = $derived(off || !lockScreen || !options.values['show-in-lock-screen']);
</script>

{#snippet toggle(key: keyof AppOptions, label: string, disabled: boolean)}
	<Switch {label} {disabled} checked={options.values[key] ?? true} onchange={(on) => options.set(key, on)} />
{/snippet}

<Dialog title={app.name} {onclose}>
	<div class="row-group">
		<Row title={t('settings-notifications-allow')}>
			{@render toggle('enable', t('settings-notifications-allow'), false)}
		</Row>
		<Row title={t('settings-notifications-banners')} description={t('settings-notifications-banners-description')} disabled={off}>
			{@render toggle('show-banners', t('settings-notifications-banners'), off)}
		</Row>
		<Row title={t('settings-notifications-sound')} description={t('settings-notifications-sound-description')} disabled={off}>
			<Select
				label={t('settings-notifications-sound')}
				options={sounds}
				value={rules.values.sound ?? 'automatic'}
				disabled={off}
				onchange={(value) => rules.set('sound', value)}
			/>
		</Row>
		<Row title={t('settings-notifications-dnd-allow')} description={t('settings-notifications-dnd-allow-description')} disabled={off}>
			<Select
				label={t('settings-notifications-dnd-allow')}
				options={doNotDisturb}
				value={rules.values['during-do-not-disturb'] ?? 'urgent'}
				disabled={off}
				onchange={(value) => rules.set('during-do-not-disturb', value)}
			/>
		</Row>
		<Row title={t('settings-notifications-keep')} description={t('settings-notifications-keep-description')} disabled={off}>
			<Switch
				label={t('settings-notifications-keep')}
				disabled={off}
				checked={rules.values['keep-in-list'] ?? true}
				onchange={(on) => rules.set('keep-in-list', on)}
			/>
		</Row>
		<Row title={t('settings-notifications-app-lock-screen')} disabled={off || !lockScreen}>
			{@render toggle('show-in-lock-screen', t('settings-notifications-app-lock-screen'), off || !lockScreen)}
		</Row>
		<Row title={t('settings-notifications-content-lock-screen')} disabled={hiddenOnLockScreen}>
			{@render toggle('details-in-lock-screen', t('settings-notifications-content-lock-screen'), hiddenOnLockScreen)}
		</Row>
	</div>
	{#snippet actions()}
		<button type="button" class="button primary" onclick={onclose}>{t('settings-notifications-done')}</button>
	{/snippet}
</Dialog>
