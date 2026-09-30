<script lang="ts">
	import { MediaControls, MenuButton, MenuItem, MenuSeparator, tooltip } from '@luft/ui';
	import Captions from '@lucide/svelte/icons/captions';
	import Gauge from '@lucide/svelte/icons/gauge';
	import Maximize from '@lucide/svelte/icons/maximize';
	import Minimize from '@lucide/svelte/icons/minimize';
	import PictureInPicture2 from '@lucide/svelte/icons/picture-in-picture-2';
	import type { SubtitleTrack } from '$lib/api';
	import { chrome } from '$lib/app/chrome.svelte';
	import { volume } from '$lib/playback/volume.svelte';
	import type { FramePreview } from './frame-preview';

	const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
	const languages = new Intl.DisplayNames(undefined, { type: 'language' });

	interface Props {
		paused: boolean;
		time: number;
		duration: number;
		buffered: number;
		rate: number;
		tracks: SubtitleTrack[];
		track: SubtitleTrack | null;
		frames: FramePreview | null;
		pictureInPicture: boolean;
		onseek: (time: number) => void;
		onrate: (rate: number) => void;
		ontrack: (track: SubtitleTrack | null) => void;
		onpicture: () => void;
	}

	let { paused = $bindable(), time, duration, buffered, rate, tracks, track, frames, pictureInPicture, onseek, onrate, ontrack, onpicture }: Props = $props();

	function trackName(candidate: SubtitleTrack, index: number) {
		const language = candidate.language && languages.of(candidate.language);
		if (candidate.label && language && candidate.label.toLowerCase() !== candidate.language) return `${language} · ${candidate.label}`;
		return language || candidate.label || `Track ${index + 1}`;
	}
</script>

{#snippet framePreview(at: number)}
	<div class="frame" {@attach (node) => void (frames!.request(at), node.append(frames!.canvas))}></div>
{/snippet}

<MediaControls
	class="video-controls"
	bind:paused
	bind:currentTime={() => time, onseek}
	{duration}
	{buffered}
	bind:volume={volume.level}
	bind:muted={volume.muted}
	preview={frames ? framePreview : undefined}
>
	{#if tracks.length}
		<MenuButton class="icon-button" label="Subtitles" align="end" {@attach tooltip('Subtitles')}>
			{#snippet trigger()}<Captions size={17} class={track ? 'text-[var(--accent)]' : ''} />{/snippet}
			{#snippet children(close)}
				<MenuItem
					checked={!track}
					onclick={() => {
						close();
						ontrack(null);
					}}>Off</MenuItem
				>
				<MenuSeparator />
				{#each tracks as candidate, index (candidate.id)}
					<MenuItem
						checked={track?.id === candidate.id}
						onclick={() => {
							close();
							ontrack(candidate);
						}}>{trackName(candidate, index)}</MenuItem
					>
				{/each}
			{/snippet}
		</MenuButton>
	{/if}
	<MenuButton class="icon-button" label="Speed" align="end" minWidth={140} {@attach tooltip('Speed')}>
		{#snippet trigger()}<Gauge size={17} class={rate !== 1 ? 'text-[var(--accent)]' : ''} />{/snippet}
		{#snippet children(close)}
			{#each RATES as option (option)}
				<MenuItem
					checked={rate === option}
					onclick={() => {
						close();
						onrate(option);
					}}>{option === 1 ? 'Normal' : `${option}×`}</MenuItem
				>
			{/each}
		{/snippet}
	</MenuButton>
	{#if pictureInPicture}
		<button type="button" class="icon-button" aria-label="Picture in picture" onclick={onpicture} {@attach tooltip('Picture in picture')}>
			<PictureInPicture2 size={17} />
		</button>
	{/if}
	<button
		type="button"
		class="icon-button"
		aria-label={chrome.fullscreen ? 'Leave fullscreen' : 'Fullscreen'}
		onclick={() => chrome.setFullscreen(!chrome.fullscreen)}
		{@attach tooltip(chrome.fullscreen ? 'Leave fullscreen' : 'Fullscreen')}
	>
		{#if chrome.fullscreen}<Minimize size={17} />{:else}<Maximize size={17} />{/if}
	</button>
</MediaControls>

<style>
	.frame :global(canvas) {
		display: block;
		border-radius: 8px;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
	}
</style>
