<script lang="ts">
	import { formatClock, VirtualScroller, type VirtualHandle } from '@luft/ui';
	import AudioLines from '@lucide/svelte/icons/audio-lines';
	import Artwork from './Artwork.svelte';
	import { player } from './player.svelte';
	import { trackArtist, trackTitle } from './queue';

	const LAYOUT = { itemHeight: 52, gap: 2, padding: { top: 2, right: 10, bottom: 16, left: 10 } };

	let scroller = $state<VirtualHandle>();
	let ordered = $derived(player.order.map((index) => ({ index, track: player.queue[index] })));

	$effect(() => {
		if (player.position >= 0) scroller?.scrollToIndex(player.position, 'nearest');
	});
</script>

<VirtualScroller bind:this={scroller} class="hidden-scroll scroll-fade min-h-0 flex-1" items={ordered} key={(entry) => `${entry.index}`} layout={LAYOUT}>
	{#snippet children({ index, track })}
		<button type="button" class="song" class:current={index === player.index} onclick={() => player.jump(index)}>
			<Artwork art={track.art} size={36} radius={7} />
			<span class="min-w-0 flex-1 text-left">
				<span class="block truncate text-[13px] font-medium">{trackTitle(track)}</span>
				<span class="block truncate text-[12px] text-[var(--sidebar-text-muted)]">{trackArtist(track) ?? ''}</span>
			</span>
			{#if index === player.index && player.playing}
				<AudioLines size={15} class="flex-none text-[var(--accent)]" />
			{:else if track.duration}
				<span class="flex-none text-[12px] text-[var(--sidebar-text-muted)] tabular-nums">{formatClock(track.duration)}</span>
			{/if}
		</button>
	{/snippet}
</VirtualScroller>

<style>
	.song {
		display: flex;
		height: 100%;
		width: 100%;
		align-items: center;
		gap: 10px;
		border-radius: 12px;
		padding-inline: 8px;
		color: var(--sidebar-text);
		transition: background-color 150ms var(--ease);
	}

	.song:hover {
		background: var(--sidebar-control);
	}

	.song.current {
		background: var(--sidebar-active);
		color: var(--text);
	}
</style>
