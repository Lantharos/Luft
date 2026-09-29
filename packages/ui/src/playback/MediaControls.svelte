<script lang="ts">
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import { tooltip } from '../menus/tooltip';
	import { formatClock } from './clock';
	import SeekBar from './SeekBar.svelte';
	import VolumeControl from './VolumeControl.svelte';

	interface Props {
		paused: boolean;
		currentTime: number;
		duration: number;
		muted: boolean;
		volume?: number;
		buffered?: number;
		class?: ClassValue;
		preview?: Snippet<[number]>;
		children?: Snippet;
		onscrub?: (scrubbing: boolean) => void;
	}

	let {
		paused = $bindable(),
		currentTime = $bindable(),
		duration,
		muted = $bindable(),
		volume = $bindable(1),
		buffered = 0,
		class: className,
		preview,
		children,
		onscrub
	}: Props = $props();
</script>

<div class={['media-controls', className]}>
	<button
		type="button"
		class="icon-button"
		aria-label={paused ? 'Play' : 'Pause'}
		onclick={() => (paused = !paused)}
		{@attach tooltip(paused ? 'Play' : 'Pause')}
	>
		{#if paused}
			<Play size={16} fill="currentColor" />
		{:else}
			<Pause size={16} fill="currentColor" />
		{/if}
	</button>
	<span class="time">{formatClock(currentTime)}</span>
	<div class="min-w-0 flex-1">
		<SeekBar time={currentTime} {duration} {buffered} {preview} {onscrub} onseek={(time) => (currentTime = time)} />
	</div>
	<span class="time">{formatClock(duration)}</span>
	<VolumeControl bind:volume bind:muted />
	{@render children?.()}
</div>

<style>
	.media-controls {
		display: flex;
		width: min(640px, 100%);
		flex: none;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		background: var(--control);
		padding: 4px 8px;
	}

	.time {
		min-width: 38px;
		color: var(--text-muted);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
</style>
