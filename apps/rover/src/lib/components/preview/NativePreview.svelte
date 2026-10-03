<script lang="ts">
	import type { NativeVideo } from '@lantharos/sabine';
	import { MediaControls, MediaState, NativeVideoSurface } from '@luft/ui';
	import type { MediaInfo } from '#lib/file-manager/inspect/details.svelte.js';

	interface Props {
		source: string;
		onmedia?: (media: MediaInfo) => void;
		onfail: () => void;
	}

	let { source, onmedia, onfail }: Props = $props();

	let player = $state.raw<NativeVideo | null>(null);
	let media = $state.raw<MediaState | null>(null);
	let ratio = $derived(media?.width && media.height ? media.width / media.height : 16 / 9);

	$effect(() => {
		if (!player) return;
		const state = new MediaState(player);
		media = state;
		return () => {
			state.destroy();
			media = null;
		};
	});

	$effect(() => {
		if (media?.width) onmedia?.({ width: media.width, height: media.height, duration: media.duration || null });
	});
</script>

<div class="native-fit" style:--ratio={ratio}>
	<NativeVideoSurface class="native-preview" src={source} autoplay cutout={document.body} bind:player {onfail} onclick={() => media?.setPaused(!media.paused)} />
</div>
{#if media}
	<MediaControls
		bind:paused={() => media!.paused, (paused) => media!.setPaused(paused)}
		bind:currentTime={() => media!.currentTime, (time) => media!.seek(time)}
		duration={media.duration}
		bind:muted={() => media!.muted, (muted) => media!.setMuted(muted)}
		bind:volume={() => media!.volume, (volume) => media!.setVolume(volume)}
	/>
{/if}

<style>
	.native-fit {
		display: grid;
		min-height: 0;
		width: 100%;
		flex: 1 1 auto;
		place-items: center;
		container-type: size;
	}

	.native-fit :global(.native-preview) {
		width: min(100cqw, 100cqh * var(--ratio));
		aspect-ratio: var(--ratio);
		border-radius: 8px;
	}
</style>
