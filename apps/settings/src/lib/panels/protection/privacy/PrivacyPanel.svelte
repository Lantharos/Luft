<script lang="ts">
	import { t } from '@luft/i18n';
	import { Dialog, longDuration, Row, Section, Select, Switch } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { app } from '#lib/state/app.svelte.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { days, including } from './format';

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

	let lockDelays = $derived([
		{ value: 0, label: t('settings-privacy-lock-immediately') },
		...[30, 60, 120, 180, 300, 1800, 3600].map((seconds) => ({ value: seconds, label: longDuration(seconds) }))
	]);
	let historyAges = $derived([
		...[1, 7, 30].map((count) => ({ value: count, label: days(count) })),
		{ value: -1, label: t('settings-privacy-keep-forever') }
	]);
	let fileAges = $derived([1, 7, 14, 30].map((count) => ({ value: count, label: days(count) })));

	let idle = $derived(session.values['idle-delay'] ?? 0);
	let locking = $derived(screensaver.values['lock-enabled'] ?? true);
	let locating = $derived(location.values.enabled ?? false);
	let camera = $derived(!(privacy.values['disable-camera'] ?? false));
	let remembering = $derived(privacy.values['remember-recent-files'] ?? true);
	let cleaning = $derived((privacy.values['remove-old-trash-files'] ?? false) || (privacy.values['remove-old-temp-files'] ?? false));

	async function clear() {
		await commands.privacyClearHistory();
		clearing = false;
	}
</script>

<Section title={t('settings-privacy-screen-lock')}>
	<Row title={t('settings-privacy-screen-off')} description={t('settings-privacy-screen-off-hint')} onclick={() => app.open('power')}>
		<span>{idle ? t('settings-privacy-screen-off-after', { duration: longDuration(idle) }) : t('settings-privacy-screen-off-never')}</span>
	</Row>
	<Row title={t('settings-privacy-lock-when-off')}>
		<Switch label={t('settings-privacy-lock-when-off')} checked={locking} onchange={(on) => screensaver.set('lock-enabled', on)} />
	</Row>
	<Row title={t('settings-privacy-lock-after')} description={t('settings-privacy-lock-after-hint')} disabled={!locking}>
		<Select
			label={t('settings-privacy-lock-after')}
			options={including(lockDelays, screensaver.values['lock-delay'], longDuration)}
			value={screensaver.values['lock-delay'] ?? 0}
			disabled={!locking}
			onchange={(seconds) => screensaver.set('lock-delay', seconds)}
		/>
	</Row>
</Section>

<Section>
	<Row title={t('settings-privacy-location-services')} description={t('settings-privacy-location-services-hint')}>
		<Switch label={t('settings-privacy-location-services')} checked={locating} onchange={(on) => location.set('enabled', on)} />
	</Row>
	<Row title={t('settings-privacy-camera-allow')}>
		<Switch label={t('settings-privacy-camera-allow')} checked={camera} onchange={(on) => privacy.set('disable-camera', !on)} />
	</Row>
	<Row title={t('settings-privacy-microphone-allow')}>
		<Switch
			label={t('settings-privacy-microphone-allow')}
			checked={!(privacy.values['disable-microphone'] ?? false)}
			onchange={(on) => privacy.set('disable-microphone', !on)}
		/>
	</Row>
</Section>

<Section title={t('settings-privacy-file-history')}>
	<Row title={t('settings-privacy-remember-files')} description={t('settings-privacy-remember-files-hint')}>
		<Switch label={t('settings-privacy-remember-files')} checked={remembering} onchange={(on) => privacy.set('remember-recent-files', on)} />
	</Row>
	<Row title={t('settings-privacy-keep-history')} disabled={!remembering}>
		<Select
			label={t('settings-privacy-keep-history')}
			options={including(historyAges, privacy.values['recent-files-max-age'], days)}
			value={privacy.values['recent-files-max-age'] ?? -1}
			disabled={!remembering}
			onchange={(age) => privacy.set('recent-files-max-age', age)}
		/>
	</Row>
	<Row title={t('settings-privacy-clear-history')} description={t('settings-privacy-clear-history-hint')}>
		<button type="button" class="button" onclick={() => (clearing = true)}>{t('settings-privacy-clear')}</button>
	</Row>
</Section>

<Section title={t('settings-privacy-cleanup')}>
	<Row title={t('settings-privacy-empty-trash')}>
		<Switch
			label={t('settings-privacy-empty-trash')}
			checked={privacy.values['remove-old-trash-files'] ?? false}
			onchange={(on) => privacy.set('remove-old-trash-files', on)}
		/>
	</Row>
	<Row title={t('settings-privacy-delete-temp')} description={t('settings-privacy-delete-temp-hint')}>
		<Switch
			label={t('settings-privacy-delete-temp')}
			checked={privacy.values['remove-old-temp-files'] ?? false}
			onchange={(on) => privacy.set('remove-old-temp-files', on)}
		/>
	</Row>
	<Row title={t('settings-privacy-delete-after')} description={t('settings-privacy-delete-after-hint')} disabled={!cleaning}>
		<Select
			label={t('settings-privacy-delete-after')}
			options={including(fileAges, privacy.values['old-files-age'], days)}
			value={privacy.values['old-files-age'] ?? 30}
			disabled={!cleaning}
			onchange={(age) => privacy.set('old-files-age', age)}
		/>
	</Row>
</Section>

{#if clearing}
	<Dialog title={t('settings-privacy-clear-title')} description={t('settings-privacy-clear-description')} onclose={() => (clearing = false)}>
		{#snippet actions()}
			<button type="button" class="button" onclick={() => (clearing = false)}>{t('settings-protection-cancel')}</button>
			<button type="button" class="button danger" onclick={clear}>{t('settings-privacy-clear-history')}</button>
		{/snippet}
	</Dialog>
{/if}
