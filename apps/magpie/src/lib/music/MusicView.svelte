<script lang="ts">
	import { formatClock, SeekBar, tooltip, VolumeControl } from '@luft/ui';
	import AudioWaveform from '@lucide/svelte/icons/audio-waveform';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Repeat from '@lucide/svelte/icons/repeat';
	import Repeat1 from '@lucide/svelte/icons/repeat-1';
	import Shuffle from '@lucide/svelte/icons/shuffle';
	import SkipBack from '@lucide/svelte/icons/skip-back';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import { untrack } from 'svelte';
	import { chrome } from '#lib/app/chrome.svelte.js';
	import type { Item } from '#lib/bindings.js';
	import { library } from '#lib/library/library.svelte.js';
	import { screenAwake } from '#lib/playback/awake.js';
	import { volume } from '#lib/playback/volume.svelte.js';
	import Artwork from './Artwork.svelte';
	import { player } from './player.svelte';
	import { trackArtist, trackTitle } from './queue';
	import { visualizer } from './visualizer/settings.svelte';

	let { item }: { item: Item } = $props();

	let height = $state(800);
	let cover = $state<HTMLElement>();
	let listening = $derived(chrome.fullscreen);
	let artSize = $derived(Math.round(listening ? Math.min(520, height * 0.5, height - 420) : Math.min(360, height * 0.42)));
	let track = $derived(player.track);
	let byline = $derived(track ? [trackArtist(track), track.album].filter(Boolean).join(' · ') : '');
	let repeatLabel = $derived(player.repeat === 'None' ? 'Repeat' : player.repeat === 'Playlist' ? 'Repeat one' : 'Stop repeating');

	$effect(() => {
		const path = item.path;
		untrack(() => {
			if (player.track?.path === path) return;
			if (player.has(path)) player.jumpTo(path);
			else void player.load(library.siblings.map((sibling) => sibling.path), path);
		});
	});

	$effect(() => {
		const playing = player.track?.path;
		const match = playing && library.siblings.find((sibling) => sibling.path === playing);
		if (match) library.select(match);
	});

	$effect(() => {
		visualizer.cover = cover ?? null;
		return () => (visualizer.cover = null);
	});

	$effect(() => {
		screenAwake.keep(listening && player.playing);
		return () => screenAwake.keep(false);
	});

	$effect(() => {
		void volume.level;
		void volume.muted;
		player.applyVolume();
		volume.save();
	});

	function toggleListening(event: MouseEvent) {
		if (event.target instanceof Element && event.target.closest('.controls')) return;
		chrome.setFullscreen(!chrome.fullscreen);
	}
</script>

<svelte:window bind:innerHeight={height} />

<div class="music" class:listening role="presentation" onpointermove={chrome.wake} ondblclick={toggleListening}>
	{#if track}
		<div class={['flex w-full flex-col items-center gap-7', listening ? 'max-w-[560px]' : 'max-w-[440px]']}>
			<div bind:this={cover} class="shadow-[0_24px_60px_var(--shadow-soft)]" style:border-radius="14px">
				<Artwork art={track.art} size={artSize} radius={14} />
			</div>
			<div class="w-full min-w-0 text-center">
				<h2 class="title truncate font-semibold text-[var(--text)]" {@attach tooltip(trackTitle(track))}>{trackTitle(track)}</h2>
				<p class="byline mt-1 truncate text-[var(--text-muted)]">{byline}</p>
			</div>
			<div class="controls flex w-full flex-col items-center gap-7" class:fade-idle={listening && player.playing}>
				<div class="w-full">
					<SeekBar time={player.time} duration={player.duration} onseek={(time) => player.seek(time)} />
					<div class="flex justify-between text-[12px] text-[var(--text-muted)] tabular-nums">
						<span>{formatClock(player.time)}</span>
						<span>{formatClock(player.duration)}</span>
					</div>
				</div>
				<div class="flex items-center gap-3">
					<button
						type="button"
						class="icon-button"
						class:on={player.shuffle}
						aria-label="Shuffle"
						aria-pressed={player.shuffle}
						onclick={() => player.setShuffle(!player.shuffle)}
						{@attach tooltip('Shuffle')}
					>
						<Shuffle size={17} />
					</button>
					<button type="button" class="icon-button large" aria-label="Previous" onclick={() => player.previous()} {@attach tooltip('Previous')}>
						<SkipBack size={20} fill="currentColor" />
					</button>
					<button type="button" class="play" aria-label={player.paused ? 'Play' : 'Pause'} onclick={() => player.toggle()}>
						{#if player.paused}<Play size={24} fill="currentColor" />{:else}<Pause size={24} fill="currentColor" />{/if}
					</button>
					<button type="button" class="icon-button large" aria-label="Next" disabled={!player.hasNext} onclick={() => player.next()} {@attach tooltip('Next')}>
						<SkipForward size={20} fill="currentColor" />
					</button>
					<button
						type="button"
						class="icon-button"
						class:on={player.repeat !== 'None'}
						aria-label={repeatLabel}
						onclick={() => player.cycleRepeat()}
						{@attach tooltip(repeatLabel)}
					>
						{#if player.repeat === 'Track'}<Repeat1 size={17} />{:else}<Repeat size={17} />{/if}
					</button>
				</div>
				<div class="flex items-center gap-2">
					<VolumeControl bind:volume={volume.level} bind:muted={volume.muted} />
					<button
						type="button"
						class="icon-button"
						class:on={visualizer.on}
						aria-label="Visualizer"
						aria-pressed={visualizer.on}
						onclick={() => visualizer.toggle()}
						{@attach tooltip('Visualizer')}
					>
						<AudioWaveform size={17} />
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.music {
		display: flex;
		height: 100%;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 24px 32px 40px;
	}

	.music.listening {
		padding-block: 64px;
	}

	.title {
		font-size: 21px;
	}

	.byline {
		font-size: 14px;
	}

	.listening .title {
		font-size: 30px;
	}

	.listening .byline {
		font-size: 16px;
	}

	.play {
		display: grid;
		height: 60px;
		width: 60px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--accent);
		color: var(--accent-text);
		transition:
			transform var(--motion-tap) var(--ease-decelerate),
			filter var(--motion-tap) var(--ease-decelerate);
	}

	.play:hover {
		background: var(--accent-hover);
	}

	.play:active {
		transform: scale(0.95);
	}

	.on {
		color: var(--accent);
	}
</style>
