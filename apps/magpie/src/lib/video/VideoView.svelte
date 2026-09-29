<script lang="ts">
	import type { NativeVideo } from '@lantharos/sabine';
	import { canPlayNatively, decodeFailed, NativeVideoSurface } from '@luft/ui';
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
	import { explain, playable } from './codecs';
	import { FramePreview } from './frame-preview';
	import { savedPosition, savePosition } from './positions';
	import { CueClock, parseSubtitles, plainCues } from './subtitles.svelte';
	import VideoControls from './VideoControls.svelte';

	const SAVE_EVERY_MS = 5000;
	const SEEK_STEP = 5;
	const LONG_SEEK_STEP = 10;
	const VOLUME_STEP = 0.05;
	const MEDIA_EVENTS = {
		loadedmetadata: restore,
		timeupdate: progress,
		play: playing,
		pause: playing,
		seeked: () => mediaSession.update(owner),
		ratechange: () => ((rate = media!.playbackRate), mediaSession.update(owner)),
		ended: remember
	};

	let { item }: { item: Item } = $props();

	const source = $derived(fileSource(item.path, item.modified));
	const clock = new CueClock();
	const track = Math.floor(Math.random() * 1e9);

	let video = $state<HTMLVideoElement>();
	let native = $state(false);
	let player = $state.raw<NativeVideo | null>(null);
	let paused = $state(true);
	let time = $state(0);
	let duration = $state(0);
	let buffered = $state(0);
	let rate = $state(1);
	let info = $state.raw<VideoInfo | null>(null);
	let subtitle = $state.raw<SubtitleTrack | null>(null);
	let problem = $state<string | null>(null);
	let lastSaved = 0;

	let media = $derived(native ? (player ?? undefined) : video);
	let frames = $derived(native ? null : new FramePreview(source));
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
			position: media?.currentTime ?? 0,
			rate,
			volume: volume.muted ? 0 : volume.level,
			shuffle: false,
			repeat: 'None',
			canNext: library.hasNext,
			canPrevious: library.hasPrevious
		}),
		handle: (action: MediaAction) => {
			if (!media) return;
			if (action.action === 'play') void media.play();
			else if (action.action === 'pause' || action.action === 'stop') media.pause();
			else if (action.action === 'toggle') toggle();
			else if (action.action === 'next') library.step(1);
			else if (action.action === 'previous') library.step(-1);
			else if (action.action === 'seek') seek(media.currentTime + action.value);
			else if (action.action === 'position') seek(action.value);
			else if (action.action === 'volume') volume.level = action.value;
			else if (action.action === 'rate') media.playbackRate = action.value;
		}
	};

	$effect(() => {
		api.videoInfo(item.path).then((found) => {
			info = found;
			if (!playable(found) && canPlayNatively()) native = true;
		});
	});

	$effect(() => {
		const target = player;
		if (!target) return;
		const events = Object.entries(MEDIA_EVENTS) as [keyof typeof MEDIA_EVENTS, () => void][];
		for (const [name, handler] of events) target.addEventListener(name, handler);
		return () => events.forEach(([name, handler]) => target.removeEventListener(name, handler));
	});

	$effect(() => {
		const preview = frames;
		return () => preview?.destroy();
	});

	$effect(() => {
		chrome.seeThrough = native;
		return () => (chrome.seeThrough = false);
	});

	$effect(() => {
		if (!media) return;
		media.volume = volume.level;
		media.muted = volume.muted;
		volume.save();
	});

	$effect(() => {
		if (!current) media?.pause();
	});

	$effect(() => {
		if (current) return registerKeys(keydown);
	});

	function keydown(event: KeyboardEvent) {
		if (!media) return false;
		const primary = event.ctrlKey || event.metaKey;
		const { key } = event;
		if (key === ' ' || key === 'k') toggle();
		else if (primary && key === 'ArrowRight') library.step(1);
		else if (primary && key === 'ArrowLeft') library.step(-1);
		else if (key === 'ArrowRight') seek(media.currentTime + SEEK_STEP);
		else if (key === 'ArrowLeft') seek(media.currentTime - SEEK_STEP);
		else if (key === 'l') seek(media.currentTime + LONG_SEEK_STEP);
		else if (key === 'j') seek(media.currentTime - LONG_SEEK_STEP);
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
		mediaSession.release(owner);
	});

	function toggle() {
		if (!media) return;
		if (media.paused) void media.play();
		else media.pause();
	}

	function seek(next: number) {
		if (!media) return;
		media.currentTime = Math.min(Math.max(0, next), duration || next);
		time = media.currentTime;
	}

	function remember() {
		if (media && duration) savePosition(item, media.currentTime, duration);
	}

	function restore() {
		duration = media!.duration;
		const saved = savedPosition(item);
		if (saved) seek(saved);
		if (current) void media!.play().catch(() => {});
	}

	function progress() {
		time = media!.currentTime;
		if (media instanceof HTMLMediaElement) {
			const ranges = media.buffered;
			buffered = ranges.length ? ranges.end(ranges.length - 1) : 0;
		} else {
			buffered = duration;
		}
		if (performance.now() - lastSaved > SAVE_EVERY_MS) {
			lastSaved = performance.now();
			remember();
		}
	}

	function playing() {
		paused = media!.paused;
		chrome.watching = !paused;
		if (!paused) mediaSession.claim(owner);
		else mediaSession.update(owner);
		remember();
	}

	async function chooseSubtitle(next: SubtitleTrack | null) {
		subtitle = next;
		if (!next || !media) return clock.detach();
		const cues: Cue[] = next.path
			? parseSubtitles(await fetch(fileSource(next.path)).then((response) => response.text()))
			: plainCues(await api.subtitleCues(item.path, next.id));
		if (subtitle === next && media) clock.attach(media, cues);
	}

	function failed() {
		const undecodable = decodeFailed(video!);
		if (undecodable && canPlayNatively()) native = true;
		else problem = undecodable ? explain(info) : "This video can't be played.";
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
		{#if native}
			<NativeVideoSurface
				class="surface"
				src={source}
				bind:player
				onfail={() => (problem = "This video can't be played.")}
				onclick={toggle}
				ondblclick={() => chrome.setFullscreen(!chrome.fullscreen)}
			/>
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
				onseeked={MEDIA_EVENTS.seeked}
				onratechange={MEDIA_EVENTS.ratechange}
				onended={remember}
				onerror={failed}
				onclick={toggle}
				ondblclick={() => chrome.setFullscreen(!chrome.fullscreen)}
			></video>
		{/if}
		{#if paused}
			<button type="button" class="big-play" aria-label="Play" onclick={() => media?.play()}>
				<Play size={30} fill="currentColor" />
			</button>
		{/if}
		{#if clock.text}
			<div class="cue" class:raised={!chrome.idle}>{clock.text}</div>
		{/if}
		<div class="controls fade-idle">
			<VideoControls
				bind:paused={() => paused, (value) => (value ? media?.pause() : void media?.play())}
				{time}
				{duration}
				{buffered}
				{rate}
				{frames}
				tracks={info?.subtitles ?? []}
				track={subtitle}
				pictureInPicture={!native && document.pictureInPictureEnabled}
				onseek={seek}
				onrate={(next) => media && (media.playbackRate = next)}
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

	video,
	.player :global(.surface) {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
	}

	video {
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
