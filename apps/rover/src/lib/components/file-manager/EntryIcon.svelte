<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	type EntryIconName = 'folder' | 'file' | 'image' | 'video' | 'music' | 'archive' | 'code' | 'file-text' | 'package';
	type Density = 'row' | 'grid';

	interface Props {
		name: EntryIconName;
		density?: Density;
		thumbnail?: string | null;
	}

	let { name, density = 'row', thumbnail = null }: Props = $props();
	let failedThumbnail = $state<string | null>(null);

	const toneFor = (icon: EntryIconName) => {
		if (icon === 'folder') return 'folder';
		if (icon === 'image' || icon === 'video' || icon === 'music') return 'media';
		if (icon === 'archive') return 'archive';
		if (icon === 'package') return 'package';
		if (icon === 'code') return 'code';
		return 'file';
	};

	let tone = $derived(toneFor(name));
	let iconSize = $derived(density === 'grid' ? 38 : 21);
	let hasThumbnail = $derived(Boolean(thumbnail && failedThumbnail !== thumbnail));
</script>

<span class={['entry-icon', `entry-icon--${density}`, hasThumbnail ? 'entry-icon--thumbnail' : `entry-icon--${tone}`]} aria-hidden="true">
	{#if hasThumbnail && thumbnail}
		<img class="entry-thumbnail" src={thumbnail} alt="" loading="lazy" draggable="false" onerror={() => (failedThumbnail = thumbnail)} />
	{:else}
		<Icon {name} size={iconSize} />
	{/if}
</span>
