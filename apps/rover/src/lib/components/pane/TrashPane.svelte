<script lang="ts">
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { enterDelay } from '$lib/file-manager/listing/entries';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { TrashLocation } from '$lib/types';
	import { formatBytes, formatDate, plural } from '$lib/utils/format';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();
	let chosenLocation = $state<string | null>(null);

	let locations = $derived(manager.trash.locations);
	let activeLocation = $derived(
		locations.find((location) => location.path === chosenLocation)?.path ?? locations[0]?.path ?? null
	);
	let items = $derived(manager.trash.items.filter((item) => item.trash_path === activeLocation));
	let selectedIds = $derived(items.filter((item) => manager.selection.has(item.id)).map((item) => item.id));

	function locationLabel(location: TrashLocation) {
		return location.name === 'Home' ? 'Home trash' : location.name;
	}
</script>

{#if locations.length > 1}
	<div class="pb-2 pt-1">
		<div class="soft-scroll inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-[rgba(245,245,242,0.055)] p-1">
			{#each locations as location (location.path)}
				<button
					class={[
						'min-h-8 shrink-0 rounded-full px-3 text-[13px] transition-[background-color,color] duration-200',
						activeLocation === location.path
							? 'bg-[var(--sidebar-active)] text-[var(--text)]'
							: 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'
					]}
					type="button"
					onclick={() => (chosenLocation = location.path)}
				>
					{locationLabel(location)}
				</button>
			{/each}
		</div>
	</div>
{/if}

{#if items.length === 0}
	<div class="empty-pane">
		<Icon name="trash" size={42} />
		<p>Trash is empty</p>
	</div>
{:else}
	<div class="flex items-center justify-between pb-2 pt-1 text-[13px] text-[var(--text-muted)]">
		<span>{plural(items.length, 'item')}</span>
		<div class="flex gap-2">
			<button
				class="command-button"
				type="button"
				disabled={selectedIds.length === 0}
				onclick={() => manager.actions.restoreTrash(selectedIds)}
			>
				Restore
			</button>
			<button class="danger-button" type="button" onclick={() => manager.actions.emptyTrash(activeLocation)}>
				Empty trash
			</button>
		</div>
	</div>
	<div class="grid gap-1">
		{#each items as item, index (item.id)}
			<button
				class={['file-row', manager.selection.has(item.id) && 'selected-entry']}
				style:animation-delay={enterDelay(index)}
				type="button"
				onclick={() => manager.toggleSelected(item.id)}
			>
				<EntryIcon name={item.is_dir ? 'folder' : 'file'} />
				<div class="min-w-0 flex-1">
					<div class="truncate text-[14px]">{item.name}</div>
					<div class="truncate text-[12px] text-[var(--text-muted)]">{item.original_path}</div>
				</div>
				<span class="w-[88px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">
					{item.is_dir ? '' : formatBytes(item.size)}
				</span>
				<span class="shrink-0 text-[12px] text-[var(--text-muted)]">{formatDate(item.deleted_at)}</span>
			</button>
		{/each}
	</div>
{/if}
