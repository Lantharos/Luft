<script lang="ts">
	import { onDestroy } from 'svelte';
	import Mic from '@lucide/svelte/icons/mic';
	import MicOff from '@lucide/svelte/icons/mic-off';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { Row, Section, Select, Slider, Switch } from '@luft/ui';
	import SubPage from '$lib/components/SubPage.svelte';
	import { percent } from '$lib/format';
	import { useSettings } from '$lib/state/gsettings.svelte';
	import {
		onInputLevel,
		onSoundChanged,
		setAlertVolume,
		setBalance,
		setDefault,
		setMeter,
		setMute,
		setPort,
		setVolume,
		startSound,
		type Device,
		type Direction,
		type Sound
	} from './api';
	import AppsSection from './AppsSection.svelte';
	import DevicesSection from './DevicesSection.svelte';
	import LevelMeter from './LevelMeter.svelte';
	import VolumeRow from './VolumeRow.svelte';

	type Alerts = {
		'event-sounds': boolean;
		'input-feedback-sounds': boolean;
		'allow-volume-above-100-percent': boolean;
	};

	const LOUD_MAX = 1.5;

	const alerts = useSettings<Alerts>('org.gnome.desktop.sound', ['event-sounds', 'input-feedback-sounds', 'allow-volume-above-100-percent']);

	let sound = $state<Sound | null>(null);
	let level = $state(0);
	let page = $state<'apps' | 'devices' | null>(null);

	let max = $derived(alerts.values['allow-volume-above-100-percent'] ? LOUD_MAX : 1);
	let output = $derived(sound?.outputs.find((device) => device.name === sound?.defaultOutput));
	let input = $derived(sound?.inputs.find((device) => device.name === sound?.defaultInput));
	let playing = $derived(sound?.apps.length ?? 0);

	$effect(() => {
		if (page === 'apps' && !playing) page = null;
	});

	const choices = (devices: Device[]) => devices.map((device) => ({ value: device.name, label: device.description }));

	function side(balance: number) {
		if (Math.abs(balance) < 0.005) return 'Center';
		return `${Math.round(Math.abs(balance) * 100)}% ${balance < 0 ? 'left' : 'right'}`;
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
		<Row title="Device">
			<Select label="{direction === 'output' ? 'Output' : 'Input'} device" options={choices(devices)} value={current.name} onchange={(name) => setDefault(direction, name)} />
		</Row>
	{/if}
	{#if current.ports.length > 1 && current.port}
		<Row title="Connection">
			<Select
				label="{direction === 'output' ? 'Output' : 'Input'} connection"
				options={current.ports.map((port) => ({ value: port.name, label: port.description }))}
				value={current.port}
				onchange={(port) => setPort(direction, current.index, port)}
			/>
		</Row>
	{/if}
{/snippet}

{#if sound && page === 'apps'}
	<SubPage title="App volumes" back="Sound" onclose={() => (page = null)}>
		<AppsSection apps={sound.apps} outputs={sound.outputs} {max} />
	</SubPage>
{:else if sound && page === 'devices'}
	<SubPage title="Device profiles" back="Sound" onclose={() => (page = null)}>
		<DevicesSection cards={sound.cards} />
	</SubPage>
{:else if sound}
	{#if output}
		<Section title="Output">
			{@render devicePicker('output', sound.outputs, output)}
			<VolumeRow
				title="Volume"
				volume={output.volume}
				muted={output.muted}
				{max}
				icon={Volume2}
				mutedIcon={VolumeX}
				onvolume={(volume) => setVolume('output', output!.index, volume)}
				onmute={(muted) => setMute('output', output!.index, muted)}
			/>
			{#if output.balance !== null}
				<Row title="Balance">
					<span>{side(output.balance)}</span>
					{#snippet below()}
						<Slider label="Balance" min={-1} max={1} value={output!.balance!} format={side} oninput={(balance) => setBalance(output!.index, balance)} onchange={(balance) => setBalance(output!.index, balance)} />
					{/snippet}
				</Row>
			{/if}
			<Row title="Allow louder than 100%" description="Sound can distort at higher volumes">
				<Switch label="Allow louder than 100%" checked={max > 1} onchange={(on) => alerts.set('allow-volume-above-100-percent', on)} />
			</Row>
		</Section>
	{/if}

	{#if input}
		<Section title="Input">
			{@render devicePicker('input', sound.inputs, input)}
			<VolumeRow
				title="Volume"
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
				<Row title="App volumes" description="{playing} {playing === 1 ? 'app is' : 'apps are'} playing sound" onclick={() => (page = 'apps')} />
			{/if}
			{#if sound.cards.length}
				<Row title="Device profiles" description="Choose how each sound device is used" onclick={() => (page = 'devices')} />
			{/if}
		</Section>
	{/if}

	<Section title="Alerts">
		<Row title="Alert sounds" description="Plays a sound for notifications and other events">
			<Switch label="Alert sounds" checked={alerts.values['event-sounds'] ?? true} onchange={(on) => alerts.set('event-sounds', on)} />
		</Row>
		{#if sound.alertVolume !== null && (alerts.values['event-sounds'] ?? true)}
			<Row title="Alert volume">
				<span class="w-11 text-right tabular-nums">{percent(sound.alertVolume)}</span>
				{#snippet below()}
					<Slider label="Alert volume" value={sound!.alertVolume!} format={percent} onchange={setAlertVolume} />
				{/snippet}
			</Row>
		{/if}
		<Row title="Typing and clicking sounds" description="Plays a sound when you type or click">
			<Switch label="Typing and clicking sounds" checked={alerts.values['input-feedback-sounds'] ?? false} onchange={(on) => alerts.set('input-feedback-sounds', on)} />
		</Row>
	</Section>
{/if}
