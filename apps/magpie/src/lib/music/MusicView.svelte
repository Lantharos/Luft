<script lang="ts">
	import { formatClock, SeekBar, tooltip, VolumeControl } from '@luft/ui';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import Repeat from '@lucide/svelte/icons/repeat';
	import Repeat1 from '@lucide/svelte/icons/repeat-1';
	import Shuffle from '@lucide/svelte/icons/shuffle';
	import SkipBack from '@lucide/svelte/icons/skip-back';
	import SkipForward from '@lucide/svelte/icons/skip-forward';
	import { untrack } from 'svelte';
	import type { Item } from '#lib/bridge/api.js';
	import { library } from '#lib/library/library.svelte.js';
	import { volume } from '#lib/playback/volume.svelte.js';
	import Artwork from './Artwork.svelte';
	import { player } from './player.svelte';
	import { trackArtist, trackTitle } from './queue';

	let { item }: { item: Item } = $props();

	let height = $state(800);
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
		void volume.level;
		void volume.muted;
		player.applyVolume();
		volume.save();
	});
</script>

<svelte:window bind:innerHeight={height} />

<div class="music">
	{#if track}
		<div class="flex w-full max-w-[440px] flex-col items-center gap-7">
			<div class="shadow-[0_24px_60px_var(--shadow-soft)]" style:border-radius="14px">
				<Artwork art={track.art} size={Math.round(Math.min(360, height * 0.42))} radius={14} />
			</div>
			<div class="w-full min-w-0 text-center">
				<h2 class="truncate text-[21px] font-semibold text-[var(--text)]" title={trackTitle(track)}>{trackTitle(track)}</h2>
				<p class="mt-1 truncate text-[14px] text-[var(--text-muted)]">{byline}</p>
			</div>
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
			<VolumeControl bind:volume={volume.level} bind:muted={volume.muted} />
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

	.play {
		display: grid;
		height: 60px;
		width: 60px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--accent);
		color: var(--accent-text);
		transition:
			transform 160ms var(--ease),
			filter 160ms var(--ease);
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
