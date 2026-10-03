<script lang="ts">
	import { bytes, plural, Segmented, VirtualScroller } from '@luft/ui';
	import EntryIcon from '#lib/components/pane/EntryIcon.svelte';
	import { dialogs } from '#lib/features/dialogs.svelte.js';
	import EmptyState from '#lib/components/pane/EmptyState.svelte';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { TrashItem } from '#lib/types/index.js';
	import { formatDate } from '#lib/utils/format.js';
	import { parentPath } from '#lib/utils/paths.js';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();

	const LAYOUT = { itemHeight: 40, gap: 2, padding: { top: 2, right: 10, bottom: 24, left: 10 } };

	let chosenLocation = $state<string | null>(null);

	let locations = $derived(manager.trash.locations);
	let activeLocation = $derived(
		locations.find((location) => location.path === chosenLocation)?.path ?? locations[0]?.path ?? null
	);
	let items = $derived(manager.trash.items.filter((item) => item.trash_path === activeLocation));
	let selectedIds = $derived(items.filter((item) => manager.selection.has(item.id)).map((item) => item.id));
	let locationOptions = $derived(
		locations.map((location) => ({ value: location.path, label: location.name === 'Home' ? 'Home' : location.name }))
	);

	function select(item: TrashItem, event: MouseEvent) {
		if (event.ctrlKey || event.metaKey || event.shiftKey) manager.toggleSelected(item.id);
		else manager.selectOnly(item.id);
	}
</script>

{#if items.length === 0 && !manager.loading.active}
	<EmptyState icon="trash" title="Trash is empty" />
{:else}
	<div class="trash-bar">
		{#if locationOptions.length > 1 && activeLocation}
			<Segmented options={locationOptions} value={activeLocation} label="Trash location" onchange={(path) => (chosenLocation = path)} />
		{:else}
			<span>{plural(items.length, 'item')}</span>
		{/if}
		<div class="flex gap-2">
			<button class="button" type="button" disabled={selectedIds.length === 0} onclick={() => manager.actions.restoreTrash(selectedIds)}>
				Restore
			</button>
			<button class="button danger" type="button" onclick={() => dialogs.emptyTrash(activeLocation)}>Empty trash</button>
		</div>
	</div>
	<VirtualScroller class="entry-scroller soft-scroll" {items} key={(item) => item.id} layout={LAYOUT} role="listbox" aria-label="Trash">
		{#snippet children(item)}
			<div
				class={['entry list-grid list-row trash-row', manager.selection.has(item.id) && 'is-selected']}
				role="option"
				aria-selected={manager.selection.has(item.id)}
				tabindex="-1"
				onclick={(event) => select(item, event)}
				onkeydown={(event) => event.key === 'Enter' && manager.toggleSelected(item.id)}
			>
				<span class="list-name">
					<EntryIcon name={item.is_dir ? 'folder' : 'file'} size={24} />
					<span class="flex min-w-0 flex-col">
						<span class="truncate">{item.name}</span>
						<span class="truncate text-[12px] text-[var(--text-muted)]">{parentPath(item.original_path)}</span>
					</span>
				</span>
				<span class="list-cell list-date">{formatDate(item.deleted_at)}</span>
				<span class="list-cell list-size">{item.is_dir ? '' : bytes(item.size)}</span>
			</div>
		{/snippet}
	</VirtualScroller>
{/if}
