<script lang="ts">
	import { Dialog, Row, Section, Select, Switch } from '@luft/ui';
	import { app } from '$lib/state/app.svelte';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import { clearHistory } from './api';
	import AppPermissions from './AppPermissions.svelte';
	import { days, duration, including } from './format';

	type Screensaver = { 'lock-enabled': boolean; 'lock-delay': number };
	type Session = { 'idle-delay': number };
	type Location = { enabled: boolean };
	type Privacy = {
		'disable-camera': boolean;
		'disable-microphone': boolean;
		'remember-recent-files': boolean;
		'recent-files-max-age': number;
		'remove-old-trash-files': boolean;
		'remove-old-temp-files': boolean;
		'old-files-age': number;
	};

	const LOCK_DELAYS = [
		{ value: 0, label: 'Immediately' },
		...[30, 60, 120, 180, 300, 1800, 3600].map((seconds) => ({ value: seconds, label: duration(seconds) }))
	];
	const HISTORY_AGES = [
		...[1, 7, 30].map((count) => ({ value: count, label: days(count) })),
		{ value: -1, label: 'Forever' }
	];
	const FILE_AGES = [1, 7, 14, 30].map((count) => ({ value: count, label: days(count) }));

	const screensaver = useSettings<Screensaver>('org.gnome.desktop.screensaver', ['lock-enabled', 'lock-delay']);
	const session = useSettings<Session>('org.gnome.desktop.session', ['idle-delay']);
	const location = useSettings<Location>('org.gnome.system.location', ['enabled']);
	const privacy = useSettings<Privacy>('org.gnome.desktop.privacy', [
		'disable-camera',
		'disable-microphone',
		'remember-recent-files',
		'recent-files-max-age',
		'remove-old-trash-files',
		'remove-old-temp-files',
		'old-files-age'
	]);

	let clearing = $state(false);

	let idle = $derived(session.values['idle-delay'] ?? 0);
	let locking = $derived(screensaver.values['lock-enabled'] ?? true);
	let locating = $derived(location.values.enabled ?? false);
	let camera = $derived(!(privacy.values['disable-camera'] ?? false));
	let remembering = $derived(privacy.values['remember-recent-files'] ?? true);
	let cleaning = $derived((privacy.values['remove-old-trash-files'] ?? false) || (privacy.values['remove-old-temp-files'] ?? false));

	async function clear() {
		await clearHistory();
		clearing = false;
	}
</script>

<Section title="Screen lock">
	<Row title="Screen turns off" description="Set in Power & Battery" onclick={() => app.open('power')}>
		<span>{idle ? `After ${duration(idle)}` : 'Never'}</span>
	</Row>
	<Row title="Lock the screen when it turns off">
		<Switch label="Lock the screen when it turns off" checked={locking} onchange={(on) => screensaver.set('lock-enabled', on)} />
	</Row>
	<Row title="Lock after" description="How long to wait once the screen is off" disabled={!locking}>
		<Select
			label="Lock after"
			options={including(LOCK_DELAYS, screensaver.values['lock-delay'], duration)}
			value={screensaver.values['lock-delay'] ?? 0}
			disabled={!locking}
			onchange={(seconds) => screensaver.set('lock-delay', seconds)}
		/>
	</Row>
</Section>

<Section title="Location">
	<Row title="Location services" description="Lets apps find where you are for maps, weather, and your time zone">
		<Switch label="Location services" checked={locating} onchange={(on) => location.set('enabled', on)} />
	</Row>
	<AppPermissions kind="location" disabled={!locating} empty="No apps have asked for your location" />
</Section>

<Section title="Camera">
	<Row title="Allow apps to use the camera">
		<Switch label="Allow apps to use the camera" checked={camera} onchange={(on) => privacy.set('disable-camera', !on)} />
	</Row>
	<AppPermissions kind="camera" disabled={!camera} empty="No apps have asked to use the camera" />
</Section>

<Section title="Microphone">
	<Row title="Allow apps to use the microphone">
		<Switch
			label="Allow apps to use the microphone"
			checked={!(privacy.values['disable-microphone'] ?? false)}
			onchange={(on) => privacy.set('disable-microphone', !on)}
		/>
	</Row>
</Section>

<Section title="File history">
	<Row title="Remember recently used files" description="Apps can show the files you opened last">
		<Switch label="Remember recently used files" checked={remembering} onchange={(on) => privacy.set('remember-recent-files', on)} />
	</Row>
	<Row title="Keep history for" disabled={!remembering}>
		<Select
			label="Keep history for"
			options={including(HISTORY_AGES, privacy.values['recent-files-max-age'], days)}
			value={privacy.values['recent-files-max-age'] ?? -1}
			disabled={!remembering}
			onchange={(age) => privacy.set('recent-files-max-age', age)}
		/>
	</Row>
	<Row title="Clear history" description="Forget every file in the list right now">
		<button type="button" class="button" onclick={() => (clearing = true)}>Clear</button>
	</Row>
</Section>

<Section title="Trash and temporary files">
	<Row title="Empty trash automatically">
		<Switch
			label="Empty trash automatically"
			checked={privacy.values['remove-old-trash-files'] ?? false}
			onchange={(on) => privacy.set('remove-old-trash-files', on)}
		/>
	</Row>
	<Row title="Delete temporary files automatically" description="Your own files in the temporary folders that nothing has used lately">
		<Switch
			label="Delete temporary files automatically"
			checked={privacy.values['remove-old-temp-files'] ?? false}
			onchange={(on) => privacy.set('remove-old-temp-files', on)}
		/>
	</Row>
	<Row title="Delete after" description="How long files stay before they're removed" disabled={!cleaning}>
		<Select
			label="Delete after"
			options={including(FILE_AGES, privacy.values['old-files-age'], days)}
			value={privacy.values['old-files-age'] ?? 30}
			disabled={!cleaning}
			onchange={(age) => privacy.set('old-files-age', age)}
		/>
	</Row>
</Section>

{#if clearing}
	<Dialog title="Clear file history?" description="Apps will no longer show the files you opened recently. The files themselves stay where they are." onclose={() => (clearing = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (clearing = false)}>Cancel</button>
			<button type="button" class="button danger" onclick={clear}>Clear history</button>
		{/snippet}
	</Dialog>
{/if}
