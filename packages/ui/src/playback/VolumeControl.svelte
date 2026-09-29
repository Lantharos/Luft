<script lang="ts">
	import Volume from '@lucide/svelte/icons/volume';
	import Volume1 from '@lucide/svelte/icons/volume-1';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import Slider from '../controls/Slider.svelte';
	import { tooltip } from '../menus/tooltip';

	interface Props {
		volume?: number;
		muted?: boolean;
	}

	let { volume = $bindable(1), muted = $bindable(false) }: Props = $props();

	let silent = $derived(muted || volume === 0);
	let Icon = $derived(silent ? VolumeX : volume < 0.34 ? Volume : volume < 0.67 ? Volume1 : Volume2);

	function toggleMute() {
		if (silent) {
			muted = false;
			volume ||= 1;
		} else {
			muted = true;
		}
	}

	function setVolume(level: number) {
		volume = level;
		muted = level === 0;
	}
</script>

<div class="volume">
	<button
		type="button"
		class="icon-button"
		aria-label={silent ? 'Unmute' : 'Mute'}
		onclick={toggleMute}
		{@attach tooltip(silent ? 'Unmute' : 'Mute')}
	>
		<Icon size={17} />
	</button>
	<div class="level">
		<Slider value={silent ? 0 : volume} step={0.01} label="Volume" oninput={setVolume} onchange={setVolume} />
	</div>
</div>

<style>
	.volume {
		display: flex;
		align-items: center;
	}

	.level {
		width: 0;
		overflow: hidden;
		opacity: 0;
		transition:
			width 200ms var(--ease),
			opacity 160ms var(--ease);
	}

	.volume:hover .level,
	.volume:focus-within .level {
		width: 124px;
		padding-inline: 2px 4px;
		opacity: 1;
	}
</style>
