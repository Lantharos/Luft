<script lang="ts">
	import { Slider, tooltip } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import { formatClock } from '$lib/utils/format';

	interface Props {
		paused: boolean;
		currentTime: number;
		duration: number;
		muted: boolean;
	}

	let { paused = $bindable(), currentTime = $bindable(), duration, muted = $bindable() }: Props = $props();

	let length = $derived(Number.isFinite(duration) ? duration : 0);
</script>

<div class="media-controls">
	<button
		class="icon-button"
		type="button"
		aria-label={paused ? 'Play' : 'Pause'}
		onclick={() => (paused = !paused)}
		{@attach tooltip(paused ? 'Play' : 'Pause')}
	>
		<Icon name={paused ? 'play' : 'pause'} size={15} />
	</button>
	<span class="media-controls__time">{formatClock(currentTime)}</span>
	<div class="min-w-0 flex-1">
		<Slider
			value={Math.min(currentTime, length)}
			max={length || 1}
			step={0.01}
			label="Position"
			disabled={length === 0}
			oninput={(time) => (currentTime = time)}
			onchange={(time) => (currentTime = time)}
		/>
	</div>
	<span class="media-controls__time">{formatClock(length)}</span>
	<button
		class="icon-button"
		type="button"
		aria-label={muted ? 'Unmute' : 'Mute'}
		onclick={() => (muted = !muted)}
		{@attach tooltip(muted ? 'Unmute' : 'Mute')}
	>
		<Icon name={muted ? 'volume-x' : 'volume'} size={16} />
	</button>
</div>
