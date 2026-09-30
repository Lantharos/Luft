<script lang="ts">
	import FileText from '@lucide/svelte/icons/file-text';
	import Film from '@lucide/svelte/icons/film';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import Image from '@lucide/svelte/icons/image';
	import Music from '@lucide/svelte/icons/music';
	import type { Place } from '$lib/api';
	import * as api from '$lib/api';
	import { library } from '$lib/library/library.svelte';
	import { PLACE_NAMES } from '$lib/library/places';

	const ICONS: Record<Place, typeof Image> = { pictures: Image, videos: Film, music: Music, documents: FileText };

	async function openFolder() {
		const folder = await api.chooseFolder().catch(() => null);
		if (folder) await library.browse(folder);
	}
</script>

<nav class="flex flex-col gap-0.5">
	{#each library.places as location (location.place)}
		{@const Icon = ICONS[location.place]}
		<button
			type="button"
			class="place"
			class:active={library.folder === location.path}
			aria-current={library.folder === location.path ? 'page' : undefined}
			onclick={() => library.browse(location.path)}
		>
			<Icon size={17} />
			<span class="truncate">{PLACE_NAMES[location.place]}</span>
		</button>
	{/each}
	<button type="button" class="place" onclick={openFolder}>
		<FolderOpen size={17} />
		<span class="truncate">Open folder…</span>
	</button>
</nav>

<style>
	.place {
		display: flex;
		height: 36px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease),
			transform 150ms var(--ease);
	}

	.place:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.place.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.place:active {
		transform: scale(0.97);
	}
</style>
