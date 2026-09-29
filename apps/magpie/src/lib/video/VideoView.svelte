<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import { onDestroy } from 'svelte';
	import type { Cue, Item, MediaAction, SubtitleTrack, VideoInfo } from '$lib/api';
	import * as api from '$lib/api';
	import { chrome } from '$lib/app/chrome.svelte';
	import { registerKeys } from '$lib/app/keys';
	import { fileSource } from '$lib/bridge';
	import { library } from '$lib/library/library.svelte';
	import { mediaSession, type MediaOwner } from '$lib/playback/session';
	import { volume } from '$lib/playback/volume.svelte';
	import CantShow from '$lib/shell/CantShow.svelte';
	import { explain } from './codecs';
	import { FramePreview } from './frame-preview';
	import { savedPosition, savePosition } from './positions';
	import { CueClock, parseSubtitles } from './subtitles.svelte';
	import VideoControls from './VideoControls.svelte';

	const SAVE_EVERY_MS = 5000;
	const SEEK_STEP = 5;
	const LONG_SEEK_STEP = 10;
	const VOLUME_STEP = 0.05;

	let { item }: { item: Item } = $props();

	const source = $derived(fileSource(item.path, item.modified));
	const frames = $derived(new FramePreview(source));
	const clock = new CueClock();
	const track = Math.floor(Math.random() * 1e9);

	let video = $state<HTMLVideoElement>();
	let paused = $state(true);
	let time = $state(0);
	let duration = $state(0);
	let buffered = $state(0);
	let rate = $state(1);
	let info = $state.raw<VideoInfo | null>(null);
	let subtitle = $state.raw<SubtitleTrack | null>(null);
	let problem = $state<string | null>(null);
	let lastSaved = 0;

	let current = $derived(library.current?.path === item.path);

	const owner: MediaOwner = {
		playback: () => ({
			track,
			status: paused ? 'Paused' : 'Playing',
			title: item.name,
			artist: null,
			album: null,
			art: null,
			path: item.path,
			length: Number.isFinite(duration) && duration > 0 ? duration : null,
			position: video?.currentTime ?? 0,
			rate,
			volume: volume.muted ? 0 : volume.level,
			shuffle: false,
			repeat: 'None',
			canNext: library.hasNext,
			canPrevious: library.hasPrevious
		}),
		handle: (action: MediaAction) => {
			if (!video) return;
			if (action.action === 'play') void video.play();
			else if (action.action === 'pause' || action.action === 'stop') video.pause();
			else if (action.action === 'toggle') void (video.paused ? video.play() : video.pause());
			else if (action.action === 'next') library.step(1);
			else if (action.action === 'previous') library.step(-1);
			else if (action.action === 'seek') seek(video.currentTime + action.value);
			else if (action.action === 'position') seek(action.value);
			else if (action.action === 'volume') volume.level = action.value;
			else if (action.action === 'rate') video.playbackRate = action.value;
		}
	};

	$effect(() => {
		api.videoInfo(item.path).then((found) => (info = found));
	});

	$effect(() => {
		if (!video) return;
		video.volume = volume.level;
		video.muted = volume.muted;
		volume.save();
	});

	$effect(() => {
		if (!current) video?.pause();
	});

	$effect(() => {
		if (current) return registerKeys(keydown);
	});

	function keydown(event: KeyboardEvent) {
		if (!video) return false;
		const primary = event.ctrlKey || event.metaKey;
		const { key } = event;
		if (key === ' ' || key === 'k') void (video.paused ? video.play() : video.pause());
		else if (primary && key === 'ArrowRight') library.step(1);
		else if (primary && key === 'ArrowLeft') library.step(-1);
		else if (key === 'ArrowRight') seek(video.currentTime + SEEK_STEP);
		else if (key === 'ArrowLeft') seek(video.currentTime - SEEK_STEP);
		else if (key === 'l') seek(video.currentTime + LONG_SEEK_STEP);
		else if (key === 'j') seek(video.currentTime - LONG_SEEK_STEP);
		else if (key === 'Home') seek(0);
		else if (key === 'ArrowUp') volume.level = Math.min(1, volume.level + VOLUME_STEP);
		else if (key === 'ArrowDown') volume.level = Math.max(0, volume.level - VOLUME_STEP);
		else if (key === 'm') volume.muted = !volume.muted;
		else return false;
		chrome.wake();
		return true;
	}

	onDestroy(() => {
		if (current) chrome.watching = false;
		remember();
		clock.detach();
		frames.destroy();
		mediaSession.release(owner);
	});

	function seek(next: number) {
		if (!video) return;
		video.currentTime = Math.min(Math.max(0, next), duration || next);
		time = video.currentTime;
	}

	function remember() {
		if (video && duration) savePosition(item, video.currentTime, duration);
	}

	function restore() {
		duration = video!.duration;
		const saved = savedPosition(item);
		if (saved) seek(saved);
		if (current) void video!.play().catch(() => {});
	}

	function progress() {
		time = video!.currentTime;
		const ranges = video!.buffered;
		buffered = ranges.length ? ranges.end(ranges.length - 1) : 0;
		if (performance.now() - lastSaved > SAVE_EVERY_MS) {
			lastSaved = performance.now();
			remember();
		}
	}

	function playing() {
		paused = video!.paused;
		chrome.watching = !paused;
		if (!paused) mediaSession.claim(owner);
		else mediaSession.update(owner);
		remember();
	}

	async function chooseSubtitle(next: SubtitleTrack | null) {
		subtitle = next;
		if (!next || !video) return clock.detach();
		const cues: Cue[] = next.path
			? parseSubtitles(await fetch(fileSource(next.path)).then((response) => response.text()))
			: await api.subtitleCues(item.path, next.id);
		if (subtitle === next) clock.attach(video, cues);
	}

	function failed() {
		const code = video?.error?.code;
		const unsupported = code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || code === MediaError.MEDIA_ERR_DECODE;
		problem = unsupported ? explain(info) : "This video can't be played.";
	}

	function pictureInPicture() {
		if (document.pictureInPictureElement) void document.exitPictureInPicture();
		else void video?.requestPictureInPicture();
	}
</script>

<div class="player" class:playing={!paused}>
	{#if problem}
		<CantShow {item} message={problem} detail="It may still open in another app." />
	{:else}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			bind:this={video}
			src={source}
			playsinline
			preload="auto"
			onloadedmetadata={restore}
			ontimeupdate={progress}
			onprogress={progress}
			onplay={playing}
			onpause={playing}
			onseeked={() => mediaSession.update(owner)}
			onratechange={() => ((rate = video!.playbackRate), mediaSession.update(owner))}
			onended={remember}
			onerror={failed}
			onclick={() => (video!.paused ? video!.play() : video!.pause())}
			ondblclick={() => chrome.setFullscreen(!chrome.fullscreen)}
		></video>
		{#if paused}
			<button type="button" class="big-play" aria-label="Play" onclick={() => video?.play()}>
				<Play size={30} fill="currentColor" />
			</button>
		{/if}
		{#if clock.text}
			<div class="cue" class:raised={!chrome.idle}>{clock.text}</div>
		{/if}
		<div class="controls fade-idle">
			<VideoControls
				bind:paused={() => paused, (value) => (value ? video?.pause() : void video?.play())}
				{time}
				{duration}
				{buffered}
				{rate}
				{frames}
				tracks={info?.subtitles ?? []}
				track={subtitle}
				pictureInPicture={document.pictureInPictureEnabled}
				onseek={seek}
				onrate={(next) => video && (video.playbackRate = next)}
				ontrack={chooseSubtitle}
				onpicture={pictureInPicture}
			/>
		</div>
	{/if}
</div>

<style>
	.player {
		position: absolute;
		inset: 0;
	}

	video {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		object-fit: contain;
	}

	.controls {
		position: absolute;
		right: 0;
		bottom: calc(24px + var(--strip-space, 0px));
		left: 0;
		display: flex;
		justify-content: center;
		padding-inline: 24px;
	}

	.controls :global(.video-controls) {
		width: min(900px, 100%);
		background: var(--control);
		box-shadow: 0 10px 32px var(--shadow-soft);
		backdrop-filter: blur(18px);
	}

	.big-play {
		position: absolute;
		top: 50%;
		left: 50%;
		display: grid;
		height: 72px;
		width: 72px;
		place-items: center;
		translate: -50% -50%;
		border-radius: var(--radius-pill);
		background: var(--control);
		color: var(--text);
		box-shadow: 0 10px 32px var(--shadow-soft);
		backdrop-filter: blur(18px);
		transition:
			transform 160ms var(--ease),
			background-color 160ms var(--ease);
	}

	.big-play:hover {
		background: var(--control-hover);
		transform: scale(1.04);
	}

	.cue {
		position: absolute;
		right: 10%;
		bottom: 40px;
		left: 10%;
		text-align: center;
		white-space: pre-line;
		color: #fff;
		font-size: clamp(16px, 2.6vh, 30px);
		font-weight: 600;
		line-height: 1.35;
		text-shadow:
			0 0 3px rgba(0, 0, 0, 0.9),
			0 1px 6px rgba(0, 0, 0, 0.8);
		transition: bottom 240ms var(--ease);
		pointer-events: none;
	}

	.cue.raised {
		bottom: calc(100px + var(--strip-space, 0px));
	}
</style>
