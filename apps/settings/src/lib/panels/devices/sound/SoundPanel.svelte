<script lang="ts">
	import { t } from '@luft/i18n';
	import { onDestroy } from 'svelte';
	import Mic from '@lucide/svelte/icons/mic';
	import MicOff from '@lucide/svelte/icons/mic-off';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import SubPage from '#lib/components/SubPage.svelte';
	import { percent } from '#lib/format.js';
	import { useSettings } from '#lib/state/gsettings.svelte.js';
	import {
		onInputLevel,
		onSoundChanged,
		playSound,
		setBalance,
		setDefault,
		setMeter,
		setMute,
		setPort,
		setVolume,
		startSound,
		type Device,
		type Direction,
		type Port,
		type Sound
	} from './api';
	import AppsSection from './AppsSection.svelte';
	import DevicesSection from './DevicesSection.svelte';
	import LevelMeter from './LevelMeter.svelte';
	import SystemSounds from './SystemSounds.svelte';
	import VolumeRow from './VolumeRow.svelte';

	type Output = {
		'allow-volume-above-100-percent': boolean;
	};

	const LOUD_MAX = 1.5;

	const loudness = useSettings<Output>('org.gnome.desktop.sound', ['allow-volume-above-100-percent']);

	let sound = $state<Sound | null>(null);
	let level = $state(0);
	let page = $state<'apps' | 'devices' | null>(null);

	let max = $derived(loudness.values['allow-volume-above-100-percent'] ? LOUD_MAX : 1);
	let output = $derived(sound?.outputs.find((device) => device.name === sound?.defaultOutput));
	let input = $derived(sound?.inputs.find((device) => device.name === sound?.defaultInput));
	let playing = $derived(sound?.apps.length ?? 0);

	$effect(() => {
		if (page === 'apps' && !playing) page = null;
	});

	const choices = (devices: Device[]) => devices.map((device) => ({ value: device.name, label: device.description }));
	const connection = (port: Port) => (port.detected ? port.description : t('settings-sound-connection-undetected', { name: port.description }));

	function side(balance: number) {
		if (Math.abs(balance) < 0.005) return t('settings-sound-balance-center');
		const amount = { share: percent(Math.abs(balance)) };
		return balance < 0 ? t('settings-sound-balance-left', amount) : t('settings-sound-balance-right', amount);
	}

	onDestroy(onSoundChanged((next) => (sound = next)));
	onDestroy(onInputLevel((next) => (level = next)));
	let open = true;
	onDestroy(() => {
		open = false;
		void setMeter(false);
	});
	void startSound().then(() => {
		if (open) void setMeter(true);
	});
</script>

{#snippet devicePicker(direction: Direction, devices: Device[], current: Device)}
	{#if devices.length > 1}
		<Row title={t('settings-sound-device')}>
			<Select label={direction === 'output' ? t('settings-sound-output-device') : t('settings-sound-input-device')} options={choices(devices)} value={current.name} onchange={(name) => setDefault(direction, name)} />
		</Row>
	{/if}
	{#if current.ports.length > 1 && current.port}
		<Row title={t('settings-sound-connection')}>
			<Select
				label={direction === 'output' ? t('settings-sound-output-connection') : t('settings-sound-input-connection')}
				options={current.ports.map((port) => ({ value: port.name, label: connection(port) }))}
				value={current.port}
				onchange={(port) => setPort(direction, current.index, port)}
			/>
		</Row>
	{/if}
{/snippet}

{#if sound && page === 'apps'}
	<SubPage title={t('settings-sound-apps')} back={t('settings-page-sound')} onclose={() => (page = null)}>
		<AppsSection apps={sound.apps} outputs={sound.outputs} {max} />
	</SubPage>
{:else if sound && page === 'devices'}
	<SubPage title={t('settings-sound-profiles')} back={t('settings-page-sound')} onclose={() => (page = null)}>
		<DevicesSection cards={sound.cards} />
	</SubPage>
{:else if sound}
	{#if output}
		<Section title={t('settings-sound-output')}>
			{@render devicePicker('output', sound.outputs, output)}
			<VolumeRow
				title={t('settings-sound-volume')}
				volume={output.volume}
				muted={output.muted}
				{max}
				icon={Volume2}
				mutedIcon={VolumeX}
				onvolume={(volume) => setVolume('output', output!.index, volume)}
				onsettle={() => playSound('audio-volume-change')}
				onmute={(muted) => setMute('output', output!.index, muted)}
			/>
			{#if output.balance !== null}
				<Row title={t('settings-sound-balance')}>
					<span>{side(output.balance)}</span>
					{#snippet below()}
						<Slider label={t('settings-sound-balance')} min={-1} max={1} value={output!.balance!} format={side} oninput={(balance) => setBalance(output!.index, balance)} onchange={(balance) => setBalance(output!.index, balance)} />
					{/snippet}
				</Row>
			{/if}
			<Row title={t('settings-sound-louder')} description={t('settings-sound-louder-description')}>
				<Switch label={t('settings-sound-louder')} checked={max > 1} onchange={(on) => loudness.set('allow-volume-above-100-percent', on)} />
			</Row>
		</Section>
	{/if}

	{#if input}
		<Section title={t('settings-sound-input')}>
			{@render devicePicker('input', sound.inputs, input)}
			<VolumeRow
				title={t('settings-sound-volume')}
				volume={input.volume}
				muted={input.muted}
				{max}
				icon={Mic}
				mutedIcon={MicOff}
				onvolume={(volume) => setVolume('input', input!.index, volume)}
				onmute={(muted) => setMute('input', input!.index, muted)}
			>
				<LevelMeter level={input.muted ? 0 : level} />
			</VolumeRow>
		</Section>
	{/if}

	{#if playing || sound.cards.length}
		<Section>
			{#if playing}
				<Row title={t('settings-sound-apps')} description={t('settings-sound-apps-playing', { count: playing })} onclick={() => (page = 'apps')} />
			{/if}
			{#if sound.cards.length}
				<Row title={t('settings-sound-profiles')} description={t('settings-sound-profiles-row-description')} onclick={() => (page = 'devices')} />
			{/if}
		</Section>
	{/if}

	<SystemSounds volume={sound.alertVolume} />
{/if}
