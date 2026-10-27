<script lang="ts">
	import { t } from '@luft/i18n';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { Section, Select } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import type { AppView, DeviceView } from '#lib/bindings.js';
	import VolumeRow from './VolumeRow.svelte';

	interface Props {
		apps: AppView[];
		outputs: DeviceView[];
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
			onvolume={(volume) => commands.soundSetVolume({ target: 'app', index: app.index, volume })}
			onmute={(muted) => commands.soundSetMute({ target: 'app', index: app.index, muted })}
		>
			{#snippet controls()}
				{#if choices.length > 1}
					<Select label={t('settings-sound-app-output', { app: app.name })} options={choices} value={app.output} onchange={(output) => commands.soundMoveApp({ index: app.index, output })} />
				{/if}
			{/snippet}
		</VolumeRow>
	{/each}
</Section>
