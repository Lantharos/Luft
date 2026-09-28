<script lang="ts">
	import EntryIcon from '$lib/components/pane/EntryIcon.svelte';
	import InlineNameField from '$lib/components/pane/InlineNameField.svelte';
	import VcsBadge from '$lib/components/vcs/VcsBadge.svelte';
	import type { ChooserState } from '$lib/file-manager/chooser.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { dropKey } from '$lib/file-manager/drag/drop-targets';
	import { enterDelay } from '$lib/file-manager/listing/entries';
	import { defaultName, type FileManager } from '$lib/file-manager/manager.svelte';
	import { localFileSource } from '$lib/runtime';
	import type { FileEntry, SortBy, ViewMode } from '$lib/types';
	import { entryIcon, isImage } from '$lib/utils/file-kinds';
	import { formatBytes, formatDate } from '$lib/utils/format';
	import type { VcsState } from '$lib/vcs/state.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		vcs: VcsState;
		chooser: ChooserState | null;
	}

	let { manager, drag, vcs, chooser }: Props = $props();

	const COLUMNS: { sort: SortBy; label: string }[] = [
		{ sort: 'name', label: 'Name' },
		{ sort: 'size', label: 'Size' },
		{ sort: 'date', label: 'Modified' },
		{ sort: 'type', label: 'Type' }
	];

	const CONTAINERS: Record<ViewMode, string> = {
		list: 'gap-1 pt-1',
		grid: 'grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2 pt-2',
		columns: 'pt-1'
	};

	let draft = $derived(manager.draft);
	let creating = $derived(draft?.mode === 'create' ? draft : null);
	let layout = $derived(manager.viewMode === 'grid' ? 'grid-tile' : manager.viewMode === 'columns' ? 'column-row' : 'file-row');
	let density = $derived<'grid' | 'row'>(manager.viewMode === 'grid' ? 'grid' : 'row');

	function thumbnail(entry: FileEntry) {
		return entry.is_file && isImage(entry) ? localFileSource(entry.path, entry.modified) : null;
	}

	function renaming(entry: FileEntry) {
		return draft?.mode === 'rename' && draft.targetPath === entry.path;
	}

	function stateClasses(entry: FileEntry) {
		const selected = manager.selection.has(entry.path);
		return [
			layout,
			selected && 'selected-entry',
			drag.target?.key === dropKey('entry', entry.path) && 'drop-target-entry',
			drag.dragging && selected && 'opacity-50',
			manager.cuttingPaths.has(entry.path) && 'cutting-entry',
			entry.is_hidden && 'hidden-entry'
		];
	}

	function interactions(entry: FileEntry) {
		const key = entry.is_dir ? dropKey('entry', entry.path) : undefined;
		const blocked = (event: Event) => event.preventDefault();
		return {
			'data-entry-path': entry.path,
			'data-drop-path': entry.is_dir ? entry.path : undefined,
			'data-drop-key': key,
			draggable: !chooser,
			onclick: (event: MouseEvent) => (chooser ? chooser.select(entry, event) : manager.handleItemClick(entry, event)),
			ondblclick: () => (chooser ? chooser.open(entry) : manager.openEntry(entry)),
			onauxclick: (event: MouseEvent) => {
				if (!chooser && event.button === 1 && entry.is_dir) void manager.openTab(entry.path);
			},
			oncontextmenu: (event: MouseEvent) => (chooser ? blocked(event) : manager.openContextMenu(event, entry)),
			ondragstart: (event: DragEvent) => (chooser ? blocked(event) : drag.start(event, entry)),
			ondragend: drag.end,
			ondragover: (event: DragEvent) => (chooser ? blocked(event) : drag.overEntry(event, entry, key)),
			ondragleave: drag.leave,
			ondrop: (event: DragEvent) => {
				if (entry.is_dir && !chooser) void drag.drop(event, entry.path);
			}
		};
	}
</script>

{#snippet details(entry: FileEntry | null)}
	{#if manager.viewMode === 'columns'}
		<span class="text-[var(--text-muted)]">{entry && !entry.is_dir ? formatBytes(entry.size) : '-'}</span>
		<span class="text-[var(--text-muted)]">{formatDate(entry?.modified ?? null)}</span>
		<span class="truncate text-[var(--text-muted)]">
			{entry ? (entry.is_dir ? 'Folder' : entry.extension || 'File') : creating?.itemType === 'folder' ? 'Folder' : 'File'}
		</span>
	{:else if manager.viewMode === 'list'}
		<span class="w-[96px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">
			{entry && !entry.is_dir ? formatBytes(entry.size) : ''}
		</span>
	{/if}
{/snippet}

{#snippet nameField(mode: 'create' | 'rename', entry: FileEntry | null)}
	<InlineNameField
		class={density === 'grid' ? 'inline-name-field--grid' : ''}
		value={draft?.value ?? ''}
		label={draft?.itemType === 'folder' ? 'Folder name' : 'File name'}
		unchangedValue={entry?.name ?? defaultName(draft?.itemType ?? 'file')}
		placeholder={entry ? '' : defaultName(draft?.itemType ?? 'file')}
		selectStem={Boolean(entry?.is_file)}
		onInput={manager.updateDraft}
		onConfirm={manager.commitDraft}
		onCancel={manager.cancelDraft}
	/>
{/snippet}

<div class={['grid pb-4', CONTAINERS[manager.viewMode]]}>
	{#if manager.viewMode === 'columns'}
		<div
			class="sticky top-0 z-10 grid h-9 grid-cols-[minmax(0,1fr)_110px_150px_100px] items-center gap-3 bg-[var(--content)] px-3 text-[12px] text-[var(--text-muted)] shadow-[0_1px_0_var(--hairline)]"
		>
			{#each COLUMNS as column (column.sort)}
				<button class="table-head" type="button" onclick={() => manager.setSortBy(column.sort)}>{column.label}</button>
			{/each}
		</div>
	{/if}

	{#if creating}
		<div class={[layout, 'bg-[var(--selection)] text-[var(--text)]']}>
			{#if manager.viewMode === 'columns'}
				<span class="flex min-w-0 items-center gap-3">
					<EntryIcon name={creating.itemType === 'folder' ? 'folder' : 'file'} />
					{@render nameField('create', null)}
				</span>
			{:else}
				<EntryIcon name={creating.itemType === 'folder' ? 'folder' : 'file'} {density} />
				{@render nameField('create', null)}
			{/if}
			{@render details(null)}
		</div>
	{/if}

	{#each manager.displayEntries as entry, index (entry.path)}
		{@const status = vcs.statusFor(entry.path, entry.is_dir)}
		{#if renaming(entry)}
			<div class={stateClasses(entry)} style:animation-delay={enterDelay(index)}>
				{#if manager.viewMode === 'columns'}
					<span class="flex min-w-0 items-center gap-3">
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnail(entry)} />
						{@render nameField('rename', entry)}
					</span>
				{:else}
					<EntryIcon name={entryIcon(entry)} {density} thumbnail={thumbnail(entry)} />
					{@render nameField('rename', entry)}
				{/if}
				{@render details(entry)}
			</div>
		{:else}
			<button class={[...stateClasses(entry), 'relative']} style:animation-delay={enterDelay(index)} type="button" {...interactions(entry)}>
				{#if manager.viewMode === 'grid'}
					<EntryIcon name={entryIcon(entry)} density="grid" thumbnail={thumbnail(entry)} />
					<VcsBadge {status} density="grid" />
					<span class="grid-name">{entry.name}</span>
				{:else if manager.viewMode === 'columns'}
					<span class="flex min-w-0 items-center gap-3">
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnail(entry)} />
						<span class="truncate">{entry.name}</span>
						<VcsBadge {status} />
					</span>
				{:else}
					<EntryIcon name={entryIcon(entry)} thumbnail={thumbnail(entry)} />
					<span class="min-w-0 flex-1 truncate text-[14px]">{entry.name}{entry.is_dir ? '/' : ''}</span>
					<VcsBadge {status} />
				{/if}
				{@render details(entry)}
			</button>
		{/if}
	{/each}
</div>
