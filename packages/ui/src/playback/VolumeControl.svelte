<script lang="ts">
	import Volume from '@lucide/svelte/icons/volume';
	import Volume1 from '@lucide/svelte/icons/volume-1';
	import Volume2 from '@lucide/svelte/icons/volume-2';
	import VolumeX from '@lucide/svelte/icons/volume-x';
	import { t } from '@luft/i18n';
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
		aria-label={t(silent ? 'ui-media-unmute' : 'ui-media-mute')}
		onclick={toggleMute}
		{@attach tooltip(t(silent ? 'ui-media-unmute' : 'ui-media-mute'))}
	>
		<Icon size={17} />
	</button>
	<div class="level">
		<Slider value={silent ? 0 : volume} step={0.01} label={t('ui-media-volume')} oninput={setVolume} onchange={setVolume} />
	</div>
</div>

<style>
	.volume {
		position: relative;
		display: flex;
		align-items: center;
	}

	.level {
		position: absolute;
		right: -6px;
		bottom: calc(100% + 8px);
		z-index: 10;
		width: 148px;
		padding: 4px 12px;
		border-radius: var(--radius-pill);
		background: var(--popover);
		box-shadow: 0 8px 24px var(--shadow-soft);
		opacity: 0;
		scale: 0.96;
		translate: 0 4px;
		transform-origin: bottom right;
		pointer-events: none;
		transition:
			opacity var(--motion-tap) linear,
			scale var(--spring-snappy-duration) var(--spring-snappy),
			translate var(--spring-snappy-duration) var(--spring-snappy);
	}

	.level::after {
		position: absolute;
		inset: 100% 0 -8px;
		content: '';
	}

	.volume:hover .level,
	.volume:focus-within .level {
		opacity: 1;
		scale: 1;
		translate: 0 0;
		pointer-events: auto;
	}
</style>
