<script lang="ts">
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { Section, Select } from '@luft/ui';
	import { moveApp, setMute, setVolume, type App, type Device } from './api';
	import VolumeRow from './VolumeRow.svelte';

	interface Props {
		apps: App[];
		outputs: Device[];
		max: number;
	}

	let { apps, outputs, max }: Props = $props();

	let choices = $derived(outputs.map((device) => ({ value: device.index, label: device.description })));
</script>

<Section>
	{#each apps as app (app.index)}
		<VolumeRow
			title={app.name}
			volume={app.volume}
			muted={app.muted}
			{max}
			icon={Volume2}
			mutedIcon={VolumeX}
			onvolume={(volume) => setVolume('app', app.index, volume)}
			onmute={(muted) => setMute('app', app.index, muted)}
		>
			{#snippet controls()}
				{#if choices.length > 1}
					<Select label="Play {app.name} on" options={choices} value={app.output} onchange={(output) => moveApp(app.index, output)} />
				{/if}
			{/snippet}
		</VolumeRow>
	{/each}
</Section>
