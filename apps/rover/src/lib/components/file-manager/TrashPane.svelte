<script lang="ts">
	import EntryIcon from '$lib/components/file-manager/EntryIcon.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { TrashItem, TrashLocation } from '$lib/types';
	import { formatBytes, formatDate } from '$lib/utils';

	interface Props {
		trashItems: TrashItem[];
		trashLocations: TrashLocation[];
		selectedPaths: Set<string>;
		onSelectTrashItem: (id: string) => void;
		onRestoreTrash: (ids?: string[]) => void;
		onEmptyTrash: (trashPath?: string) => void;
		itemDelay: (index: number) => string;
	}

	let { trashItems, trashLocations, selectedPaths, onSelectTrashItem, onRestoreTrash, onEmptyTrash, itemDelay }: Props = $props();
	let selectedTrashPath = $state<string | null>(null);

	let activeTrashPath = $derived.by(() => {
		const paths = new Set(trashLocations.map((location) => location.path));
		if (selectedTrashPath && paths.has(selectedTrashPath)) return selectedTrashPath;
		return trashLocations[0]?.path ?? null;
	});
	let visibleItems = $derived(trashItems.filter((item) => !activeTrashPath || item.trash_path === activeTrashPath));
	let selectedVisibleIds = $derived(visibleItems.filter((item) => selectedPaths.has(item.id)).map((item) => item.id));

	function locationLabel(location: TrashLocation) {
		return location.name === 'Home' ? 'Home trash' : location.name;
	}
</script>

{#if trashLocations.length > 1}
	<div class="flex items-center justify-between gap-3 pb-2 pt-1">
		<div class="soft-scroll flex min-w-0 gap-1 overflow-x-auto rounded-full bg-[rgba(245,245,242,0.055)] p-1">
			{#each trashLocations as location (location.path)}
				<button
					class={[
						'min-h-8 shrink-0 rounded-full px-3 text-[13px] text-[var(--text-muted)] transition-[background-color,color,transform] duration-200',
						activeTrashPath === location.path ? 'bg-[var(--sidebar-active)] text-[var(--text)]' : 'hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'
					]}
					type="button"
					onclick={() => (selectedTrashPath = location.path)}
				>
					{locationLabel(location)}
				</button>
			{/each}
		</div>
	</div>
{/if}

{#if visibleItems.length === 0}
	<div class="empty-pane">
		<Icon name="trash" size={42} />
		<p>Trash is empty</p>
	</div>
{:else}
	<div class="flex items-center justify-between pb-2 pt-1 text-[13px] text-[var(--text-muted)]">
		<span>{visibleItems.length} items</span>
		<div class="flex gap-2">
			<button class="command-button" type="button" disabled={selectedVisibleIds.length === 0} onclick={() => onRestoreTrash(selectedVisibleIds)}>
				Restore
			</button>
			<button class="danger-button" type="button" onclick={() => onEmptyTrash(activeTrashPath ?? undefined)}>Empty trash</button>
		</div>
	</div>
	<div class="grid gap-1">
		{#each visibleItems as item, index (item.id)}
			<button
				class={['file-row', selectedPaths.has(item.id) ? 'selected-entry' : '']}
				style:animation-delay={itemDelay(index)}
				type="button"
				onclick={() => onSelectTrashItem(item.id)}
			>
				<EntryIcon name={item.is_dir ? 'folder' : 'file'} />
				<div class="min-w-0 flex-1">
					<div class="truncate text-[14px]">{item.name}</div>
					<div class="truncate text-[12px] text-[var(--text-muted)]">{item.original_path}</div>
				</div>
				<span class="w-[88px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">{item.is_dir ? '' : formatBytes(item.size)}</span>
				<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{formatDate(item.deleted_at)}</span>
			</button>
		{/each}
	</div>
{/if}
