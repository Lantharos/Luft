<script lang="ts">
	import { t } from '@luft/i18n';
	import Play from '@lucide/svelte/icons/play';
	import { IconButton, Row, Section, Slider, Switch } from '@luft/ui';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import { previewSound, setAlertVolume } from './api';

	type Kinds = {
		notifications: boolean;
		devices: boolean;
		'volume-feedback': boolean;
		screenshots: boolean;
		recording: boolean;
		'sign-in': boolean;
		keyboard: boolean;
	};

	interface Props {
		volume: number | null;
	}

	const KINDS: { key: keyof Kinds; title: string; description: string; preview: string; sound: string }[] = [
		{ key: 'notifications', title: 'settings-sound-kind-notifications', description: 'settings-sound-kind-notifications.description', preview: 'settings-sound-kind-notifications.preview', sound: 'message-new-instant' },
		{ key: 'devices', title: 'settings-sound-kind-devices', description: 'settings-sound-kind-devices.description', preview: 'settings-sound-kind-devices.preview', sound: 'device-added' },
		{ key: 'volume-feedback', title: 'settings-sound-kind-volume', description: 'settings-sound-kind-volume.description', preview: 'settings-sound-kind-volume.preview', sound: 'audio-volume-change' },
		{ key: 'screenshots', title: 'settings-sound-kind-screenshots', description: 'settings-sound-kind-screenshots.description', preview: 'settings-sound-kind-screenshots.preview', sound: 'screen-capture' },
		{ key: 'recording', title: 'settings-sound-kind-recording', description: 'settings-sound-kind-recording.description', preview: 'settings-sound-kind-recording.preview', sound: 'recording-started' },
		{ key: 'sign-in', title: 'settings-sound-kind-sign-in', description: 'settings-sound-kind-sign-in.description', preview: 'settings-sound-kind-sign-in.preview', sound: 'desktop-login' },
		{ key: 'keyboard', title: 'settings-sound-kind-keyboard', description: 'settings-sound-kind-keyboard.description', preview: 'settings-sound-kind-keyboard.preview', sound: 'keyboard-tap' }
	];

	let { volume }: Props = $props();

	const sound = useSettings<{ 'event-sounds': boolean }>('org.gnome.desktop.sound', ['event-sounds']);
	const kinds = useSettings<Kinds>('com.lantharos.kestrel.sounds', KINDS.map((kind) => kind.key));

	let on = $derived(sound.values['event-sounds'] ?? true);
</script>

<Section title={t('settings-sound-system')}>
	<Row title={t('settings-sound-system')} description={t('settings-sound-system-description')}>
		<Switch label={t('settings-sound-system')} checked={on} onchange={(checked) => sound.set('event-sounds', checked)} />
	</Row>
	{#if on}
		{#if volume !== null}
			<Row title={t('settings-sound-volume')}>
				<span class="w-11 text-right tabular-nums">{percent(volume)}</span>
				{#snippet below()}
					<Slider label={t('settings-sound-system-volume')} value={volume!} format={percent} onchange={setAlertVolume} />
				{/snippet}
			</Row>
		{/if}
		{#each KINDS as kind (kind.key)}
			<Row title={t(kind.title)} description={t(kind.description)}>
				<IconButton icon={Play} label={t(kind.preview)} onclick={() => previewSound(kind.sound)} />
				<Switch label={t(kind.title)} checked={kinds.values[kind.key] ?? kind.key !== 'keyboard'} onchange={(checked) => kinds.set(kind.key, checked)} />
			</Row>
		{/each}
	{/if}
</Section>
