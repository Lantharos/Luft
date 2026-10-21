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
