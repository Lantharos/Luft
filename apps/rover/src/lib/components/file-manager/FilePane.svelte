<script lang="ts">
	import EntryIcon from '$lib/components/file-manager/EntryIcon.svelte';
	import InlineNameField from '$lib/components/file-manager/InlineNameField.svelte';
	import TrashPane from '$lib/components/file-manager/TrashPane.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { DriveInfo, FavoriteItem, FileEntry, InlineDraft, SidebarView, TrashItem, TrashLocation, ViewMode } from '$lib/types';
	import { formatBytes, formatDate, getFileIcon } from '$lib/utils';

	interface Props {
		currentView: SidebarView;
		currentPath: string;
		entries: FileEntry[];
		favorites: FavoriteItem[];
		trashItems: TrashItem[];
		trashLocations: TrashLocation[];
		drives: DriveInfo[];
		thumbnails: Record<string, string | null>;
		draft: InlineDraft | null;
		viewMode: ViewMode;
		selectedPaths: Set<string>;
		isLoading: boolean;
		error: string | null;
		dropTarget: string | null;
		isDragging: boolean;
		canDrag?: boolean;
		allowSelectedDoubleClick?: boolean;
		onSelectEntry: (entry: FileEntry, event: MouseEvent) => void;
		onOpenEntry: (entry: FileEntry) => void;
		onMiddleClick: (entry: FileEntry, event: MouseEvent) => void;
		onContextMenu: (event: MouseEvent, entry?: FileEntry) => void;
		onDragStart: (event: DragEvent, entry: FileEntry) => void;
		onDragEnd: () => void;
		onDragOver: (event: DragEvent, entry?: FileEntry) => void;
		onDragLeave: () => void;
		onDrop: (event: DragEvent, targetPath: string) => void;
		onSort: (sort: 'name' | 'size' | 'date' | 'type') => void;
		onNavigate: (path: string) => void;
		onSelectRange: (paths: string[]) => void;
		onDraftInput: (value: string) => void;
		onDraftConfirm: () => void;
		onDraftCancel: () => void;
		onOpenFavorite: (favorite: FavoriteItem) => void;
		onSelectTrashItem: (id: string) => void;
		onRestoreTrash: (ids?: string[]) => void;
		onEmptyTrash: (trashPath?: string) => void;
	}

	let {
		currentView,
		currentPath,
		entries,
		favorites,
		trashItems,
		trashLocations,
		drives,
		thumbnails,
		draft,
		viewMode,
		selectedPaths,
		isLoading,
		error,
		dropTarget,
		isDragging,
		canDrag = true,
		allowSelectedDoubleClick = false,
		onSelectEntry,
		onOpenEntry,
		onMiddleClick,
		onContextMenu,
		onDragStart,
		onDragEnd,
		onDragOver,
		onDragLeave,
		onDrop,
		onSort,
		onNavigate,
		onSelectRange,
		onDraftInput,
		onDraftConfirm,
		onDraftCancel,
		onOpenFavorite,
		onSelectTrashItem,
		onRestoreTrash,
		onEmptyTrash
	}: Props = $props();

	type FileIcon = 'folder' | 'file' | 'image' | 'video' | 'music' | 'archive' | 'code' | 'file-text' | 'package';
	type SelectionBox = { pointerId: number; startX: number; startY: number; currentX: number; currentY: number };

	let paneElement = $state<HTMLElement>();
	let selectionBox = $state<SelectionBox | null>(null);
	let selectionBase = new Set<string>();

	function entryIcon(entry: FileEntry): FileIcon {
		const icon = getFileIcon(entry);
		if (icon === 'audio') return 'music';
		if (['pdf', 'document', 'spreadsheet', 'presentation'].includes(icon)) return 'file-text';
		if (icon === 'package') return 'package';
		if (icon === 'executable') return 'code';
		if (['folder', 'file', 'image', 'video', 'music', 'archive', 'code'].includes(icon)) return icon as FileIcon;
		return 'file';
	}

	function thumbnailFor(entry: FileEntry) {
		return thumbnails[entry.path] ?? null;
	}

	function isRenaming(entry: FileEntry) {
		return draft?.mode === 'rename' && draft.targetPath === entry.path;
	}

	function driveUsage(drive: DriveInfo) {
		if (drive.total_space === 0) return 0;
		return Math.min(100, Math.round((drive.used_space / drive.total_space) * 100));
	}

	function itemState(path: string) {
		return [
			selectedPaths.has(path) ? 'selected-entry' : '',
			dropTarget === path ? 'outline outline-2 outline-[var(--accent)] outline-offset-[-2px]' : '',
			isDragging && selectedPaths.has(path) ? 'opacity-50' : ''
		];
	}

	function itemDelay(index: number) {
		return `${Math.min(index * 18, 140)}ms`;
	}

	function normalizedBox(box: SelectionBox) {
		const left = Math.min(box.startX, box.currentX);
		const top = Math.min(box.startY, box.currentY);
		const right = Math.max(box.startX, box.currentX);
		const bottom = Math.max(box.startY, box.currentY);
		return { left, top, right, bottom, width: right - left, height: bottom - top };
	}

	function selectionStyle(box: SelectionBox) {
		const rect = normalizedBox(box);
		return `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
	}

	function intersects(a: DOMRect, b: ReturnType<typeof normalizedBox>) {
		return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
	}

	function updateMarqueeSelection(box: SelectionBox) {
		const rect = normalizedBox(box);
		const nextSelection = new Set(selectionBase);
		paneElement?.querySelectorAll<HTMLElement>('[data-entry-path]').forEach((element) => {
			const path = element.dataset.entryPath;
			if (path && intersects(element.getBoundingClientRect(), rect)) nextSelection.add(path);
		});
		onSelectRange([...nextSelection]);
	}

	function startMarqueeSelection(event: PointerEvent) {
		if (currentView !== 'home' || event.button !== 0) return;
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest('button, input, [data-no-marquee]')) return;
		selectionBase = event.ctrlKey || event.metaKey ? new Set(selectedPaths) : new Set();
		selectionBox = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			currentX: event.clientX,
			currentY: event.clientY
		};
		onSelectRange([...selectionBase]);
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function moveMarqueeSelection(event: PointerEvent) {
		if (!selectionBox || selectionBox.pointerId !== event.pointerId) return;
		selectionBox = { ...selectionBox, currentX: event.clientX, currentY: event.clientY };
		updateMarqueeSelection(selectionBox);
	}

	function endMarqueeSelection(event: PointerEvent) {
		if (!selectionBox || selectionBox.pointerId !== event.pointerId) return;
		selectionBox = { ...selectionBox, currentX: event.clientX, currentY: event.clientY };
		updateMarqueeSelection(selectionBox);
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		selectionBox = null;
	}
</script>

<section
	bind:this={paneElement}
	class="soft-scroll relative min-h-0 flex-1 overflow-auto px-5 pb-2"
	aria-label="File browser"
	tabindex="-1"
	onpointerdown={startMarqueeSelection}
	onpointermove={moveMarqueeSelection}
	onpointerup={endMarqueeSelection}
	onpointercancel={endMarqueeSelection}
	oncontextmenu={(event) => onContextMenu(event)}
	ondragover={(event) => onDragOver(event)}
	ondrop={(event) => onDrop(event, currentPath)}
>
	{#if selectionBox}
		<div class="selection-marquee" style={selectionStyle(selectionBox)}></div>
	{/if}

	{#if isLoading}
		<div class="grid gap-2 pt-2">
			{#each Array.from({ length: 9 }) as _, index (index)}
				<div class="h-11 rounded-full bg-[var(--surface-soft)]" style:opacity={0.36 + index * 0.04}></div>
			{/each}
		</div>
	{:else if error}
		<div class="flex h-full items-center justify-center text-[var(--danger)]">
			<div class="flex max-w-[520px] items-center gap-3 rounded-[18px] bg-[var(--surface)] px-4 py-3 text-[14px] shadow-[inset_0_1px_0_var(--hairline)]">
				<Icon name="alert-circle" size={18} />
				<span class="text-pretty">{error}</span>
			</div>
		</div>
	{:else if currentView === 'drives'}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 pb-4 pt-2">
			{#each drives as drive (drive.mount_point)}
				<button class="drive-tile" type="button" onclick={() => onNavigate(drive.mount_point)}>
					<div class="flex items-center gap-3">
						<div class="grid h-10 w-10 place-items-center rounded-full bg-[var(--control)] text-[var(--text-soft)]">
							<Icon name="hard-drive" size={20} />
						</div>
						<div class="min-w-0">
							<div class="truncate text-[14px] font-medium text-[var(--text)]">{drive.name}</div>
							<div class="truncate text-[12px] text-[var(--text-muted)]">{drive.mount_point}</div>
						</div>
					</div>
					<div class="mt-4 h-2 overflow-hidden rounded-full bg-[var(--control)]">
						<div class="h-full rounded-full bg-[var(--accent)]" style:width={`${driveUsage(drive)}%`}></div>
					</div>
					<div class="mt-2 flex justify-between text-[12px] text-[var(--text-muted)]">
						<span>{formatBytes(drive.available_space)} free</span>
						<span>{driveUsage(drive)}%</span>
					</div>
				</button>
			{/each}
		</div>
	{:else if currentView === 'trash'}
		<TrashPane {trashItems} {trashLocations} {selectedPaths} {onSelectTrashItem} {onRestoreTrash} {onEmptyTrash} {itemDelay} />
	{:else if currentView === 'favorites'}
		{#if favorites.length === 0}
			<div class="empty-pane">
				<Icon name="star" size={42} />
				<p>No favorites yet</p>
			</div>
		{:else}
			<div class="grid gap-1 pt-1">
				{#each favorites as favorite, index (favorite.path)}
					<button
						class="file-row"
						style:animation-delay={itemDelay(index)}
						type="button"
						onclick={() => onOpenFavorite(favorite)}
					>
						<EntryIcon name={favorite.is_dir ? 'folder' : 'file'} />
						<div class="min-w-0 flex-1">
							<div class="truncate text-[14px]">{favorite.name}</div>
							<div class="truncate text-[12px] text-[var(--text-muted)]">{favorite.path}</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	{:else if entries.length === 0 && !draft}
		<div class="empty-pane">
			<Icon name="folder-open" size={42} />
			<p>This folder is empty</p>
		</div>
	{:else if viewMode === 'grid'}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2 pb-4 pt-2">
			{#if draft?.mode === 'create'}
				<div class={['grid-tile', 'bg-[var(--selection)] text-[var(--text)]']}>
					<EntryIcon name={draft.itemType === 'folder' ? 'folder' : 'file'} density="grid" />
					<InlineNameField
						class="inline-name-field--grid"
						value={draft.value}
						label={draft.itemType === 'folder' ? 'Folder name' : 'File name'}
						onInput={onDraftInput}
						onConfirm={onDraftConfirm}
						onCancel={onDraftCancel}
					/>
				</div>
			{/if}
			{#each entries as entry, index (entry.path)}
				{#if isRenaming(entry)}
					<div class={['grid-tile', ...itemState(entry.path)]} style:animation-delay={itemDelay(index)}>
						<EntryIcon name={entryIcon(entry)} density="grid" thumbnail={thumbnailFor(entry)} />
						<InlineNameField
							class="inline-name-field--grid"
							value={draft?.value ?? ''}
							label="File name"
							onInput={onDraftInput}
							onConfirm={onDraftConfirm}
							onCancel={onDraftCancel}
						/>
					</div>
				{:else}
					<button
						class={['grid-tile', ...itemState(entry.path)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={canDrag}
						onclick={(event) => onSelectEntry(entry, event)}
						ondblclick={() => (allowSelectedDoubleClick || !selectedPaths.has(entry.path)) && onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						ondragstart={(event) => onDragStart(event, entry)}
						ondragend={onDragEnd}
						ondragover={(event) => onDragOver(event, entry)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<EntryIcon name={entryIcon(entry)} density="grid" thumbnail={thumbnailFor(entry)} />
						<span class="grid-name">{entry.name}</span>
					</button>
				{/if}
			{/each}
		</div>
	{:else if viewMode === 'columns'}
		<div class="grid pb-4 pt-1">
			<div class="sticky top-0 z-10 grid h-9 grid-cols-[minmax(0,1fr)_110px_150px_100px] items-center gap-3 bg-[var(--content)] px-3 text-[12px] text-[var(--text-muted)] shadow-[0_1px_0_var(--hairline)]">
				<button class="table-head" type="button" onclick={() => onSort('name')}>Name</button>
				<button class="table-head" type="button" onclick={() => onSort('size')}>Size</button>
				<button class="table-head" type="button" onclick={() => onSort('date')}>Modified</button>
				<button class="table-head" type="button" onclick={() => onSort('type')}>Type</button>
			</div>
			{#if draft?.mode === 'create'}
				<div class={['table-row', 'bg-[var(--selection)] text-[var(--text)]']}>
					<span class="flex min-w-0 items-center gap-3">
						<EntryIcon name={draft.itemType === 'folder' ? 'folder' : 'file'} />
						<InlineNameField
							value={draft.value}
							label={draft.itemType === 'folder' ? 'Folder name' : 'File name'}
							onInput={onDraftInput}
							onConfirm={onDraftConfirm}
							onCancel={onDraftCancel}
						/>
					</span>
					<span class="text-[var(--text-muted)]">-</span>
					<span class="text-[var(--text-muted)]">-</span>
					<span class="truncate text-[var(--text-muted)]">{draft.itemType === 'folder' ? 'Folder' : 'File'}</span>
				</div>
			{/if}
			{#each entries as entry, index (entry.path)}
				{#if isRenaming(entry)}
					<div class={['table-row', ...itemState(entry.path)]} style:animation-delay={itemDelay(index)}>
						<span class="flex min-w-0 items-center gap-3">
							<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
							<InlineNameField
								value={draft?.value ?? ''}
								label="File name"
								onInput={onDraftInput}
								onConfirm={onDraftConfirm}
								onCancel={onDraftCancel}
							/>
						</span>
						<span class="text-[var(--text-muted)]">{entry.is_dir ? '-' : formatBytes(entry.size)}</span>
						<span class="text-[var(--text-muted)]">{entry.modified ? formatDate(entry.modified) : '-'}</span>
						<span class="truncate text-[var(--text-muted)]">{entry.is_dir ? 'Folder' : entry.extension || 'File'}</span>
					</div>
				{:else}
					<button
						class={['table-row', ...itemState(entry.path)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={canDrag}
						onclick={(event) => onSelectEntry(entry, event)}
						ondblclick={() => (allowSelectedDoubleClick || !selectedPaths.has(entry.path)) && onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						ondragstart={(event) => onDragStart(event, entry)}
						ondragend={onDragEnd}
						ondragover={(event) => onDragOver(event, entry)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<span class="flex min-w-0 items-center gap-3">
							<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
							<span class="truncate">{entry.name}</span>
						</span>
						<span class="text-[var(--text-muted)]">{entry.is_dir ? '-' : formatBytes(entry.size)}</span>
						<span class="text-[var(--text-muted)]">{entry.modified ? formatDate(entry.modified) : '-'}</span>
						<span class="truncate text-[var(--text-muted)]">{entry.is_dir ? 'Folder' : entry.extension || 'File'}</span>
					</button>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="grid gap-1 pb-4 pt-1">
			{#if draft?.mode === 'create'}
				<div class={['file-row', 'bg-[var(--selection)] text-[var(--text)]']}>
					<EntryIcon name={draft.itemType === 'folder' ? 'folder' : 'file'} />
					<InlineNameField
						value={draft.value}
						label={draft.itemType === 'folder' ? 'Folder name' : 'File name'}
						onInput={onDraftInput}
						onConfirm={onDraftConfirm}
						onCancel={onDraftCancel}
					/>
				</div>
			{/if}
			{#each entries as entry, index (entry.path)}
				{#if isRenaming(entry)}
					<div class={['file-row', ...itemState(entry.path)]} style:animation-delay={itemDelay(index)}>
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
						<InlineNameField
							value={draft?.value ?? ''}
							label="File name"
							onInput={onDraftInput}
							onConfirm={onDraftConfirm}
							onCancel={onDraftCancel}
						/>
						<span class="w-[96px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">
							{entry.is_dir ? '' : formatBytes(entry.size)}
						</span>
					</div>
				{:else}
					<button
						class={['file-row', ...itemState(entry.path)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={canDrag}
						onclick={(event) => onSelectEntry(entry, event)}
						ondblclick={() => (allowSelectedDoubleClick || !selectedPaths.has(entry.path)) && onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						ondragstart={(event) => onDragStart(event, entry)}
						ondragend={onDragEnd}
						ondragover={(event) => onDragOver(event, entry)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
						<span class="min-w-0 flex-1 truncate text-[14px]">{entry.name}{entry.is_dir ? '/' : ''}</span>
						<span class="w-[96px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">
							{entry.is_dir ? '' : formatBytes(entry.size)}
						</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</section>
