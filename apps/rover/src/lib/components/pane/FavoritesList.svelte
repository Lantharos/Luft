<script lang="ts">
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import { enterDelay } from '$lib/file-manager/listing/entries';
	import type { FavoriteItem } from '$lib/types';

	interface Props {
		favorites: FavoriteItem[];
		onOpen: (favorite: FavoriteItem) => void;
	}

	let { favorites, onOpen }: Props = $props();
</script>

<div class="grid gap-1 pt-1">
	{#each favorites as favorite, index (favorite.path)}
		<button
			class="file-row"
			style:animation-delay={enterDelay(index)}
			type="button"
			onclick={() => onOpen(favorite)}
		>
			<EntryIcon name={favorite.is_dir ? 'folder' : 'file'} />
			<div class="min-w-0 flex-1">
				<div class="truncate text-[14px]">{favorite.name}</div>
				<div class="truncate text-[12px] text-[var(--text-muted)]">{favorite.path}</div>
			</div>
		</button>
	{/each}
</div>
