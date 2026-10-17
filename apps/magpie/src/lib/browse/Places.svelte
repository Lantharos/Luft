<script lang="ts">
	import { selectionPill } from '@luft/ui';
	import FileText from '@lucide/svelte/icons/file-text';
	import Film from '@lucide/svelte/icons/film';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import Image from '@lucide/svelte/icons/image';
	import Music from '@lucide/svelte/icons/music';
	import type { Place } from '#lib/bridge/api.js';
	import * as api from '#lib/bridge/api.js';
	import { library } from '#lib/library/library.svelte.js';
	import { PLACE_NAMES } from '#lib/library/places.js';

	const ICONS: Record<Place, typeof Image> = { pictures: Image, videos: Film, music: Music, documents: FileText };

	async function openFolder() {
		const folder = await api.chooseFolder().catch(() => null);
		if (folder) await library.browse(folder);
	}
</script>

<nav class="flex flex-col gap-0.5" {@attach selectionPill()}>
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
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.place:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.place.active {
		background: transparent;
		color: var(--text);
	}

	.place:active {
		transform: scale(0.97);
	}
</style>
