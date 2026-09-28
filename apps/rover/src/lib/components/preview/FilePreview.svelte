<script lang="ts">
	import { fileUrl } from '@lantharos/sabine';
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import type { MediaInfo } from '$lib/file-manager/inspect/details.svelte';
	import { thumbnailSource } from '$lib/file-manager/listing/thumbnails';
	import { isDesktopRuntime, localFileSource } from '$lib/runtime';
	import type { FileEntry } from '$lib/types';
	import { entryIcon } from '$lib/utils/file-kinds';
	import { previewKind } from '$lib/utils/kinds';
	import TextPreview from './TextPreview.svelte';

	interface Props {
		entry: FileEntry;
		full?: boolean;
		onmedia?: (media: MediaInfo) => void;
	}

	let { entry, full = false, onmedia }: Props = $props();

	let failed = $state(false);
	let kind = $derived(isDesktopRuntime() && !failed ? previewKind(entry) : 'none');
	let source = $derived(localFileSource(entry.path, entry.modified));
	let iconSize = $derived(full ? 144 : 96);

	function reportMedia(event: Event) {
		const media = event.currentTarget as HTMLImageElement | HTMLVideoElement | HTMLAudioElement;
		if (media instanceof HTMLImageElement) return onmedia?.({ width: media.naturalWidth, height: media.naturalHeight, duration: null });
		const video = media instanceof HTMLVideoElement ? media : null;
		onmedia?.({ width: video?.videoWidth || null, height: video?.videoHeight || null, duration: Number.isFinite(media.duration) ? media.duration : null });
	}
</script>

{#if kind === 'image'}
	<img class="preview-image" src={source} alt="" decoding="async" draggable="false" onload={reportMedia} onerror={() => (failed = true)} />
{:else if kind === 'video'}
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		class="preview-image"
		src={full ? source : `${source}#t=0.1`}
		controls={full}
		autoplay={full}
		muted={!full}
		preload="metadata"
		playsinline
		onloadedmetadata={reportMedia}
		onerror={() => (failed = true)}
	></video>
{:else if kind === 'audio'}
	<div class="preview-stack">
		<EntryIcon name="music" size={iconSize} />
		<audio class={full ? 'preview-audio' : 'hidden'} src={source} controls={full} autoplay={full} preload="metadata" onloadedmetadata={reportMedia}></audio>
	</div>
{:else if kind === 'text' || kind === 'markdown'}
	<TextPreview {entry} markdown={kind === 'markdown'} {full} />
{:else if kind === 'pdf' && full}
	<iframe class="preview-document" src={fileUrl(entry.path)} title={entry.name}></iframe>
{:else}
	<div class="preview-stack">
		<EntryIcon name={entryIcon(entry)} size={iconSize} thumbnail={thumbnailSource(entry)} fit="contain" />
	</div>
{/if}
