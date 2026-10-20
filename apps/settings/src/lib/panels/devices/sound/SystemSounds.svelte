<script lang="ts">
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

	const KINDS: { key: keyof Kinds; title: string; description: string; sound: string; preview: string }[] = [
		{ key: 'notifications', title: 'Notifications', description: 'Quiet during Do Not Disturb, games and screen sharing', sound: 'message-new-instant', preview: 'Play the notification sound' },
		{ key: 'devices', title: 'Devices and charging', description: 'Connecting a device or charger, and low battery', sound: 'device-added', preview: 'Play the device sound' },
		{ key: 'volume-feedback', title: 'Volume feedback', description: 'A tick when you change the volume', sound: 'audio-volume-change', preview: 'Play the volume tick' },
		{ key: 'screenshots', title: 'Screenshots', description: 'A shutter when a screenshot is saved', sound: 'screen-capture', preview: 'Play the shutter' },
		{ key: 'recording', title: 'Recording', description: 'When screen recording, the camera or dictation starts and stops', sound: 'recording-started', preview: 'Play the recording sound' },
		{ key: 'sign-in', title: 'Sign-in sound', description: 'When your desktop appears', sound: 'desktop-login', preview: 'Play the sign-in sound' },
		{ key: 'keyboard', title: 'Keyboard taps', description: 'Each key on the on-screen keyboard', sound: 'keyboard-tap', preview: 'Play a keyboard tap' }
	];

	let { volume }: Props = $props();

	const sound = useSettings<{ 'event-sounds': boolean }>('org.gnome.desktop.sound', ['event-sounds']);
	const kinds = useSettings<Kinds>('com.lantharos.kestrel.sounds', KINDS.map((kind) => kind.key));

	let on = $derived(sound.values['event-sounds'] ?? true);
</script>

<Section title="System sounds">
	<Row title="System sounds" description="Sounds for notifications, devices and other events">
		<Switch label="System sounds" checked={on} onchange={(checked) => sound.set('event-sounds', checked)} />
	</Row>
	{#if on}
		{#if volume !== null}
			<Row title="Volume">
				<span class="w-11 text-right tabular-nums">{percent(volume)}</span>
				{#snippet below()}
					<Slider label="System sounds volume" value={volume!} format={percent} onchange={setAlertVolume} />
				{/snippet}
			</Row>
		{/if}
		{#each KINDS as kind (kind.key)}
			<Row title={kind.title} description={kind.description}>
				<IconButton icon={Play} label={kind.preview} onclick={() => previewSound(kind.sound)} />
				<Switch label={kind.title} checked={kinds.values[kind.key] ?? kind.key !== 'keyboard'} onchange={(checked) => kinds.set(kind.key, checked)} />
			</Row>
		{/each}
	{/if}
</Section>
