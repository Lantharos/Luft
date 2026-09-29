<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Pause from '@lucide/svelte/icons/pause';
	import Play from '@lucide/svelte/icons/play';
	import { library } from '$lib/library/library.svelte';
	import Artwork from './Artwork.svelte';
	import { player } from './player.svelte';
	import { trackTitle } from './queue';
</script>

{#if player.track && library.group !== 'audio'}
	<div class="now-playing">
		<button type="button" class="flex min-w-0 items-center gap-2" onclick={() => library.open(player.track!.path)} {@attach tooltip('Show music')}>
			<Artwork art={player.track.art} size={26} radius={6} />
			<span class="max-w-[160px] truncate text-[12px] font-medium">{trackTitle(player.track)}</span>
		</button>
		<button type="button" class="icon-button" aria-label={player.paused ? 'Play' : 'Pause'} onclick={() => player.toggle()}>
			{#if player.paused}<Play size={14} fill="currentColor" />{:else}<Pause size={14} fill="currentColor" />{/if}
		</button>
	</div>
{/if}

<style>
	.now-playing {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-right: 6px;
		border-radius: var(--radius-pill);
		background: var(--surface-hover);
		padding: 3px 3px 3px 4px;
		color: var(--text);
	}
</style>
