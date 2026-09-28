<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { EntryIconName } from '$lib/utils/file-kinds';

	interface Props {
		name: EntryIconName;
		size: number;
		thumbnail?: string | null;
		fit?: 'cover' | 'contain';
	}

	let { name, size, thumbnail = null, fit = 'cover' }: Props = $props();
	let failedThumbnail = $state<string | null>(null);

	const TONES: Partial<Record<EntryIconName, string>> = {
		folder: 'folder',
		image: 'media',
		video: 'media',
		music: 'media',
		archive: 'archive',
		package: 'package',
		code: 'code'
	};

	let showThumbnail = $derived(Boolean(thumbnail) && failedThumbnail !== thumbnail);
</script>

<span
	class={['entry-icon', showThumbnail ? `entry-icon--thumbnail entry-icon--${fit}` : `entry-icon--${TONES[name] ?? 'file'}`]}
	style:--icon-size="{size}px"
	aria-hidden="true"
>
	{#if showThumbnail}
		<img
			class="entry-thumbnail"
			src={thumbnail}
			alt=""
			loading="lazy"
			decoding="async"
			draggable="false"
			onerror={() => (failedThumbnail = thumbnail)}
		/>
	{:else}
		<Icon {name} size={Math.round(Math.max(14, size * 0.46))} />
	{/if}
</span>
