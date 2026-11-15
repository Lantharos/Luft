<script lang="ts">
	import { t } from '@luft/i18n';
	import { errorText, Row, Section, Select, Switch } from '@luft/ui';
	import { commands, type Notifications, type Setting } from '#lib/bindings.js';

	let { desktop }: { desktop: string } = $props();

	const sounds = $derived([
		{ value: 'automatic', label: t('app-notifications-sound-automatic') },
		{ value: 'luft', label: t('app-notifications-sound-luft') },
		{ value: 'app', label: t('app-notifications-sound-app') },
		{ value: 'none', label: t('app-notifications-sound-none') }
	]);
	const doNotDisturb = $derived([
		{ value: 'never', label: t('app-notifications-dnd-never') },
		{ value: 'urgent', label: t('app-notifications-dnd-urgent') },
		{ value: 'always', label: t('app-notifications-dnd-always') }
	]);

	let notifications = $state<Notifications | null>(null);
	let problem = $state('');

	let off = $derived(!notifications?.allowed);
	let hiddenOnLockScreen = $derived(off || !notifications?.shownOnLockScreen || !notifications?.lockScreen);

	$effect(() => {
		void commands.libraryNotifications({ desktop }).then((state) => (notifications = state));
	});

	async function change(setting: Setting) {
		problem = '';
		try {
			await commands.librarySetNotification({ desktop, setting });
			notifications = await commands.libraryNotifications({ desktop });
		} catch (reason) {
			problem = errorText(reason);
		}
	}
</script>

{#if notifications}
	<Section title={t('app-notifications')}>
		<Row title={t('app-notifications-allow')}>
			<Switch label={t('app-notifications-allow')} checked={notifications.allowed} onchange={(on) => change({ setting: 'allowed', value: on })} />
		</Row>
		<Row title={t('app-notifications-banners')} description={t('app-notifications-banners-description')} disabled={off}>
			<Switch label={t('app-notifications-banners')} checked={notifications.banners} disabled={off} onchange={(on) => change({ setting: 'banners', value: on })} />
		</Row>
		<Row title={t('app-notifications-sound')} description={t('app-notifications-sound-description')} disabled={off}>
			<Select label={t('app-notifications-sound')} options={sounds} value={notifications.sound} disabled={off} onchange={(value) => change({ setting: 'sound', value })} />
		</Row>
		<Row title={t('app-notifications-dnd')} description={t('app-notifications-dnd-description')} disabled={off}>
			<Select
				label={t('app-notifications-dnd')}
				options={doNotDisturb}
				value={notifications.duringDoNotDisturb}
				disabled={off}
				onchange={(value) => change({ setting: 'duringDoNotDisturb', value })}
			/>
		</Row>
		<Row title={t('app-notifications-keep')} description={t('app-notifications-keep-description')} disabled={off}>
			<Switch label={t('app-notifications-keep')} checked={notifications.keptInList} disabled={off} onchange={(on) => change({ setting: 'keptInList', value: on })} />
		</Row>
		<Row
			title={t('app-notifications-lock-screen')}
			description={notifications.shownOnLockScreen ? undefined : t('app-notifications-lock-screen-hidden')}
			disabled={off || !notifications.shownOnLockScreen}
		>
			<Switch
				label={t('app-notifications-lock-screen')}
				checked={notifications.lockScreen}
				disabled={off || !notifications.shownOnLockScreen}
				onchange={(on) => change({ setting: 'lockScreen', value: on })}
			/>
		</Row>
		<Row title={t('app-notifications-lock-screen-content')} disabled={hiddenOnLockScreen}>
			<Switch
				label={t('app-notifications-lock-screen-content')}
				checked={notifications.detailsOnLockScreen}
				disabled={hiddenOnLockScreen}
				onchange={(on) => change({ setting: 'detailsOnLockScreen', value: on })}
			/>
		</Row>
	</Section>
	{#if problem}
		<p class="-mt-4 px-2 text-[13px] text-[var(--danger)]">{problem}</p>
	{/if}
{/if}
