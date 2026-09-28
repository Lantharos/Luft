<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { EntryIconName } from '$lib/utils/file-kinds';

	interface Props {
		name: EntryIconName;
		density?: 'row' | 'grid';
		thumbnail?: string | null;
	}

	let { name, density = 'row', thumbnail = null }: Props = $props();
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
	class={['entry-icon', `entry-icon--${density}`, showThumbnail ? 'entry-icon--thumbnail' : `entry-icon--${TONES[name] ?? 'file'}`]}
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
		<Icon {name} size={density === 'grid' ? 38 : 21} />
	{/if}
</span>
