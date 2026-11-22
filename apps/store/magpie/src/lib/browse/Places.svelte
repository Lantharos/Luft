<script lang="ts">
	import { t } from '@luft/i18n';
	import { selectionPill } from '@luft/ui';
	import FileText from '@luft/symbols/icons/file-text';
	import Film from '@luft/symbols/icons/film';
	import FolderOpen from '@luft/symbols/icons/folder-open';
	import Image from '@luft/symbols/icons/image';
	import Music from '@luft/symbols/icons/music';
	import { commands } from '#lib/bindings.js';
	import type { Place } from '#lib/bindings.js';
	import { library } from '#lib/library/library.svelte.js';
	import { placeName } from '#lib/library/places.js';

	const ICONS: Record<Place, typeof Image> = { pictures: Image, videos: Film, music: Music, documents: FileText };

	async function openFolder() {
		const folder = await commands.chooseFolder({ timeoutMs: 24 * 60 * 60 * 1000 }).catch(() => null);
		if (folder) await library.browse(folder);
	}
</script>

<nav class="flex flex-col gap-0.5" {@attach selectionPill()}>
	{#each library.places as location (location.place)}
		{@const Icon = ICONS[location.place]}
		<button
			type="button"
			class="nav-item"
			class:active={library.folder === location.path}
			aria-current={library.folder === location.path ? 'page' : undefined}
			onclick={() => library.browse(location.path)}
		>
			<Icon size={18} />
			<span class="truncate">{placeName(location.place)}</span>
		</button>
	{/each}
	<button type="button" class="nav-item" onclick={openFolder}>
		<FolderOpen size={18} />
		<span class="truncate">{t('magpie-open-folder')}</span>
	</button>
</nav>
