<script lang="ts">
	import type { FileKind } from '#lib/utils/kinds.js';
	import { KIND_ICONS } from './kind-icons';

	interface Props {
		kind: FileKind;
		size: number;
		thumbnail?: string | null;
		backdrop?: boolean;
		app?: boolean;
		fit?: 'cover' | 'contain';
	}

	let { kind, size, thumbnail = null, backdrop = false, app = false, fit = 'cover' }: Props = $props();
	let failedThumbnail = $state<string | null>(null);

	const TONES: Partial<Record<FileKind, string>> = {
		folder: 'folder',
		image: 'media',
		video: 'media',
		audio: 'media',
		archive: 'archive',
		package: 'package',
		code: 'code'
	};

	let Icon = $derived(KIND_ICONS[kind]);
	let showThumbnail = $derived(Boolean(thumbnail) && failedThumbnail !== thumbnail);
	let artwork = $derived(app ? 'entry-icon--app' : `entry-icon--thumbnail entry-icon--${fit}`);
</script>

<span
	class={['entry-icon', showThumbnail ? artwork : `entry-icon--${TONES[kind] ?? 'file'}`]}
	style:--icon-size="{size}px"
	aria-hidden="true"
>
	{#if showThumbnail}
		<img
			class={['entry-thumbnail', backdrop && 'has-backdrop']}
			src={thumbnail}
			alt=""
			loading="lazy"
			decoding="async"
			draggable="false"
			onerror={() => (failedThumbnail = thumbnail)}
		/>
	{:else}
		<Icon size={Math.round(Math.max(14, size * 0.46))} />
	{/if}
</span>

<style>
	.entry-icon {
		display: grid;
		height: var(--icon-size);
		width: var(--icon-size);
		flex: none;
		place-items: center;
		border-radius: calc(var(--icon-size) * 0.28);
		background: color-mix(in oklab, var(--ink) 4.5%, transparent);
		color: var(--file);
	}

	.entry-icon--folder {
		background: color-mix(in srgb, var(--folder) 11%, transparent);
		color: var(--folder);
	}

	.entry-icon--media {
		background: color-mix(in srgb, var(--media) 12%, transparent);
		color: var(--media);
	}

	.entry-icon--code {
		background: color-mix(in srgb, var(--code) 10%, transparent);
		color: var(--code);
	}

	.entry-icon--archive {
		background: color-mix(in srgb, var(--archive) 12%, transparent);
		color: var(--archive);
	}

	.entry-icon--package {
		background: color-mix(in srgb, var(--success) 12%, transparent);
		color: var(--success);
	}

	.entry-icon--thumbnail {
		overflow: hidden;
		background: transparent;
	}

	.entry-icon--contain {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
	}

	.entry-icon--cover .entry-thumbnail {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	.entry-icon--contain .entry-thumbnail {
		height: auto;
		width: auto;
		max-height: 100%;
		max-width: 100%;
		border-radius: 6px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
		outline: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
		outline-offset: -1px;
	}

	.entry-icon--app {
		background: transparent;
	}

	.entry-icon--app .entry-thumbnail {
		height: 100%;
		width: 100%;
		object-fit: contain;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18));
	}

	.entry-thumbnail.has-backdrop {
		background: var(--thumbnail-backdrop);
	}
</style>
