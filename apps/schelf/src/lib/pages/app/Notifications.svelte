<script lang="ts">
	import { errorText, Row, Section, Select, Switch } from '@luft/ui';
	import { commands, type Notifications, type Setting } from '#lib/bindings.js';

	let { desktop }: { desktop: string } = $props();

	const SOUNDS = [
		{ value: 'automatic', label: 'Automatic' },
		{ value: 'luft', label: 'Luft’s sound' },
		{ value: 'app', label: 'The app’s own' },
		{ value: 'none', label: 'None' }
	];
	const DO_NOT_DISTURB = [
		{ value: 'never', label: 'Never' },
		{ value: 'urgent', label: 'Urgent only' },
		{ value: 'always', label: 'Always' }
	];

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
	<Section title="Notifications">
		<Row title="Allow notifications">
			<Switch label="Allow notifications" checked={notifications.allowed} onchange={(on) => change({ setting: 'allowed', value: on })} />
		</Row>
		<Row title="Banners" description="Pop up on screen when they arrive" disabled={off}>
			<Switch label="Banners" checked={notifications.banners} disabled={off} onchange={(on) => change({ setting: 'banners', value: on })} />
		</Row>
		<Row title="Sound" description="Automatic stays quiet when the app plays its own sound" disabled={off}>
			<Select label="Sound" options={SOUNDS} value={notifications.sound} disabled={off} onchange={(value) => change({ setting: 'sound', value })} />
		</Row>
		<Row title="Allow during Do Not Disturb" description="Urgent means alarms and calls" disabled={off}>
			<Select
				label="Allow during Do Not Disturb"
				options={DO_NOT_DISTURB}
				value={notifications.duringDoNotDisturb}
				disabled={off}
				onchange={(value) => change({ setting: 'duringDoNotDisturb', value })}
			/>
		</Row>
		<Row title="Keep in the notification list" description="Otherwise they go once their banner closes" disabled={off}>
			<Switch label="Keep in the notification list" checked={notifications.keptInList} disabled={off} onchange={(on) => change({ setting: 'keptInList', value: on })} />
		</Row>
		<Row
			title="Show on the lock screen"
			description={notifications.shownOnLockScreen ? undefined : 'Notifications are hidden on the lock screen for every app, in Settings under Privacy'}
			disabled={off || !notifications.shownOnLockScreen}
		>
			<Switch
				label="Show on the lock screen"
				checked={notifications.lockScreen}
				disabled={off || !notifications.shownOnLockScreen}
				onchange={(on) => change({ setting: 'lockScreen', value: on })}
			/>
		</Row>
		<Row title="Show message content on the lock screen" disabled={hiddenOnLockScreen}>
			<Switch
				label="Show message content on the lock screen"
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
