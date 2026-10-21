<script lang="ts" module>
	let textPreview: Promise<typeof import('./TextPreview.svelte')> | undefined;

	function loadTextPreview() {
		return (textPreview ??= import('./TextPreview.svelte'));
	}
</script>

<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import { canPlayNatively, decodeFailed, MediaControls } from '@luft/ui';
	import { localFileSource } from '#lib/api.js';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import type { MediaInfo } from '#lib/file-manager/inspect/details.svelte.js';
	import { thumbnailOf } from '#lib/file-manager/listing/thumbnails.js';
	import type { FileEntry } from '#lib/types/index.js';
	import { fileKind, mayBeTransparent, previewKind } from '#lib/utils/kinds.js';
	import NativePreview from './NativePreview.svelte';

	interface Props {
		entry: FileEntry;
		full?: boolean;
		onmedia?: (media: MediaInfo) => void;
	}

	let { entry, full = false, onmedia }: Props = $props();

	let failed = $state(false);
	let native = $state(false);
	let paused = $state(true);
	let currentTime = $state(0);
	let duration = $state(0);
	let muted = $state(false);
	let kind = $derived(failed ? 'none' : previewKind(entry));
	let source = $derived(localFileSource(entry.path, entry.modified));
	let iconSize = $derived(full ? 144 : 96);

	function reportMedia(event: Event) {
		const media = event.currentTarget as HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
		if (media instanceof HTMLImageElement) return onmedia?.({ width: media.naturalWidth, height: media.naturalHeight, duration: null });
		const video = media instanceof HTMLVideoElement ? media : null;
		onmedia?.({ width: video?.videoWidth || null, height: video?.videoHeight || null, duration: Number.isFinite(media.duration) ? media.duration : null });
	}

	function videoFailed(event: Event) {
		if (full && decodeFailed(event.currentTarget as HTMLVideoElement) && canPlayNatively()) native = true;
		else failed = true;
	}
</script>

{#if kind === 'image'}
	<img class={['preview-image', mayBeTransparent(entry) && 'has-backdrop']} src={source} alt="" decoding="async" draggable="false" onload={reportMedia} onerror={() => (failed = true)} />
{:else if kind === 'video' && native}
	<div class="preview-player">
		<NativePreview {source} {onmedia} onfail={() => (failed = true)} />
	</div>
{:else if kind === 'video'}
	<div class="preview-player">
		<!-- svelte-ignore a11y_media_has_caption, a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<video
			class="preview-image"
			src={full ? source : `${source}#t=0.1`}
			autoplay={full}
			preload="metadata"
			playsinline
			bind:paused
			bind:currentTime
			bind:duration
			bind:muted
			onclick={() => full && (paused = !paused)}
			onloadedmetadata={reportMedia}
			onerror={videoFailed}
		></video>
		{#if full}
			<MediaControls bind:paused bind:currentTime {duration} bind:muted />
		{/if}
	</div>
{:else if kind === 'audio'}
	<div class="preview-stack">
		<EntryIcon kind="audio" size={iconSize} />
		<audio
			src={source}
			autoplay={full}
			preload="metadata"
			bind:paused
			bind:currentTime
			bind:duration
			bind:muted
			onloadedmetadata={reportMedia}
		></audio>
		{#if full}
			<div class="preview-audio"><MediaControls bind:paused bind:currentTime {duration} bind:muted /></div>
		{/if}
	</div>
{:else if kind === 'text' || kind === 'markdown'}
	{#await loadTextPreview() then { default: TextPreview }}
		<TextPreview {entry} markdown={kind === 'markdown'} {full} />
	{/await}
{:else if kind === 'pdf' && full}
	<iframe class="preview-document" src={fileUrl(entry.path)} title={entry.name}></iframe>
{:else}
	<div class="preview-stack">
		<EntryIcon kind={fileKind(entry)} size={iconSize} {...thumbnailOf(entry)} fit="contain" />
	</div>
{/if}
