<script lang="ts">
	import DragBundle from '$lib/components/file-manager/DragBundle.svelte';
	import EntryIcon from '$lib/components/file-manager/EntryIcon.svelte';
	import InlineNameField from '$lib/components/file-manager/InlineNameField.svelte';
	import TrashPane from '$lib/components/file-manager/TrashPane.svelte';
	import VcsBadge from '$lib/components/file-manager/VcsBadge.svelte';
	import {
		contentPoint,
		elementContentRect,
		normalizeSelectionBox,
		rectsIntersect,
		selectionBoxStyle,
		type SelectionBox
	} from '$lib/file-manager/marquee';
	import { dropTargetKeyForPath, scopedDropKey, type DropTarget } from '$lib/file-manager/drop-targets';
	import Icon from '$lib/components/Icon.svelte';
	import type { DriveInfo, FavoriteItem, FileEntry, InlineDraft, SidebarView, TrashItem, TrashLocation, ViewMode } from '$lib/types';
	import { formatBytes, formatDate, getFileIcon } from '$lib/utils';
	import type { VcsFileStatus } from '$lib/vcs/types';

	interface Props {
		currentView: SidebarView;
		currentPath: string;
		entries: FileEntry[];
		favorites: FavoriteItem[];
		trashItems: TrashItem[];
		trashLocations: TrashLocation[];
		drives: DriveInfo[];
		ejectingDriveMounts: string[];
		thumbnails: Record<string, string | null>;
		draft: InlineDraft | null;
		viewMode: ViewMode;
		selectedPaths: Set<string>;
		cuttingPaths: Set<string>;
		showLoadingSkeleton: boolean;
		error: string | null;
		dropTargetKey: string | null;
		isDragging: boolean;
		canDrag?: boolean;
		entryVcsStatus?: (entry: FileEntry) => VcsFileStatus | null;
		onSelectEntry: (entry: FileEntry, event: MouseEvent) => void;
		onOpenEntry: (entry: FileEntry) => void;
		onMiddleClick: (entry: FileEntry, event: MouseEvent) => void;
		onContextMenu: (event: MouseEvent, entry?: FileEntry) => void;
		onDragStart: (event: DragEvent, entry: FileEntry) => void;
		onDragEnd: () => void;
		onDragOver: (event: DragEvent, entry?: FileEntry, targetKey?: string) => void;
		onDragLeave: () => void;
		onDrop: (event: DragEvent, targetPath: string) => void;
		onPathDragOver: (event: DragEvent, targetPath: string, targetKey?: string) => boolean;
		onInternalDragStart: (entry: FileEntry) => void;
		onInternalDragMove: (target: DropTarget | null) => void;
		onInternalDragEnd: (targetPath: string | null, copy: boolean) => void;
		onSort: (sort: 'name' | 'size' | 'date' | 'type') => void;
		onNavigate: (path: string) => void;
		onOpenPathInTab: (path: string) => void;
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
		ejectingDriveMounts,
		thumbnails,
		draft,
		viewMode,
		selectedPaths,
		cuttingPaths,
		showLoadingSkeleton,
		error,
		dropTargetKey,
		isDragging,
		canDrag = true,
		entryVcsStatus = () => null,
		onSelectEntry,
		onOpenEntry,
		onMiddleClick,
		onContextMenu,
		onDragStart,
		onDragEnd,
		onDragOver,
		onDragLeave,
		onDrop,
		onPathDragOver,
		onInternalDragStart,
		onInternalDragMove,
		onInternalDragEnd,
		onSort,
		onNavigate,
		onOpenPathInTab,
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

	let paneElement = $state<HTMLElement>();
	let selectionBox = $state<SelectionBox | null>(null);
	let pointerDrag = $state<{
		entry: FileEntry;
		entries: FileEntry[];
		pointerId: number;
		startX: number;
		startY: number;
		currentX: number;
		currentY: number;
		started: boolean;
		copy: boolean;
	} | null>(null);
	let suppressClickPath = $state<string | null>(null);
	let selectionBase = new Set<string>();
	let internalDrives = $derived(drives.filter((drive) => !drive.is_removable));
	let externalDrives = $derived(drives.filter((drive) => drive.is_removable));
	let draggedPathSet = $derived.by(() => new Set(pointerDrag?.started ? pointerDrag.entries.map((entry) => entry.path) : []));
	let paneEntries = $derived(entries.filter((entry) => !draggedPathSet.has(entry.path)));

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

	function vcsStatus(entry: FileEntry) {
		return entryVcsStatus(entry);
	}

	function driveUsage(drive: DriveInfo) {
		if (drive.total_space === 0) return 0;
		return Math.min(100, Math.round((drive.used_space / drive.total_space) * 100));
	}

	function driveIcon(drive: DriveInfo): 'hard-drive' | 'usb' {
		return drive.is_removable ? 'usb' : 'hard-drive';
	}

	function driveEjecting(drive: DriveInfo) {
		return ejectingDriveMounts.includes(drive.mount_point);
	}

	function openDriveWithMiddleClick(event: MouseEvent, drive: DriveInfo) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();
		onOpenPathInTab(drive.mount_point);
	}

	function paneDropKey(path: string) {
		return scopedDropKey('pane', path);
	}

	function entryDropKey(path: string) {
		return scopedDropKey('entry', path);
	}

	function driveDropKey(path: string) {
		return scopedDropKey('drive', path);
	}

	function dragEntriesFor(entry: FileEntry) {
		if (!selectedPaths.has(entry.path)) return [entry];
		const selected = entries.filter((item) => selectedPaths.has(item.path));
		return selected.length > 0 ? selected : [entry];
	}

	function dropTargetFromPoint(clientX: number, clientY: number): DropTarget | null {
		for (const element of document.elementsFromPoint(clientX, clientY)) {
			if (!(element instanceof HTMLElement)) continue;
			const target = element.closest<HTMLElement>('[data-drop-key], [data-drop-path], [data-drop-trash="true"]');
			if (!target) continue;
			const key = target.dataset.dropKey;
			const tabId = target.dataset.dropTabId ?? null;
			if (target.dataset.dropTrash === 'true') return { path: 'trash', key: key ?? 'trash', tabId };
			const pathTarget = target.closest<HTMLElement>('[data-drop-path]') ?? target;
			const targetPath = pathTarget?.dataset.dropPath;
			if (targetPath) return { path: targetPath, key: key ?? dropTargetKeyForPath(targetPath), tabId };
		}
		return null;
	}

	function startEntryPointerDrag(event: PointerEvent, entry: FileEntry) {
		if (!canDrag || currentView !== 'home' || event.button !== 0) return;
		pointerDrag = {
			entry,
			entries: dragEntriesFor(entry),
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			currentX: event.clientX,
			currentY: event.clientY,
			started: false,
			copy: event.ctrlKey || event.metaKey
		};
	}

	function moveEntryPointerDrag(event: PointerEvent) {
		if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
		const distance = Math.hypot(event.clientX - pointerDrag.startX, event.clientY - pointerDrag.startY);
		if (!pointerDrag.started) {
			if (distance < 8) return;
			pointerDrag = { ...pointerDrag, started: true, currentX: event.clientX, currentY: event.clientY };
			onInternalDragStart(pointerDrag.entry);
		}
		pointerDrag = { ...pointerDrag, currentX: event.clientX, currentY: event.clientY, copy: event.ctrlKey || event.metaKey };
		event.preventDefault();
		event.stopPropagation();
		onInternalDragMove(dropTargetFromPoint(event.clientX, event.clientY));
	}

	function endEntryPointerDrag(event: PointerEvent) {
		if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
		const wasDragging = pointerDrag.started;
		const entryPath = pointerDrag.entry.path;
		const target = wasDragging ? dropTargetFromPoint(event.clientX, event.clientY) : null;
		const copy = pointerDrag.copy;
		pointerDrag = null;
		if (!wasDragging) return;
		suppressClickPath = entryPath;
		event.preventDefault();
		event.stopPropagation();
		onInternalDragEnd(target?.path ?? null, copy);
	}

	function cancelEntryPointerDrag(event: PointerEvent) {
		if (!pointerDrag || pointerDrag.pointerId !== event.pointerId) return;
		pointerDrag = null;
		onInternalDragEnd(null, false);
	}

	function selectEntry(entry: FileEntry, event: MouseEvent) {
		if (suppressClickPath === entry.path) {
			suppressClickPath = null;
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		onSelectEntry(entry, event);
	}

	function itemState(path: string) {
		return [
			selectedPaths.has(path) ? 'selected-entry' : '',
			dropTargetKey === entryDropKey(path) ? 'drop-target-entry' : '',
			isDragging && selectedPaths.has(path) ? 'opacity-50' : '',
			cuttingPaths.has(path) ? 'cutting-entry' : ''
		];
	}

	function entryState(entry: FileEntry) {
		return [...itemState(entry.path), entry.is_hidden ? 'hidden-entry' : ''];
	}

	function itemDelay(index: number) {
		return `${Math.min(index * 18, 140)}ms`;
	}

	function updateMarqueeSelection(box: SelectionBox) {
		const rect = normalizeSelectionBox(box);
		const nextSelection = new Set(selectionBase);
		paneElement?.querySelectorAll<HTMLElement>('[data-entry-path]').forEach((element) => {
			const path = element.dataset.entryPath;
			const elementRect = elementContentRect(paneElement, element);
			if (path && elementRect && rectsIntersect(elementRect, rect)) nextSelection.add(path);
		});
		onSelectRange([...nextSelection]);
	}

	function refreshMarqueeAfterScroll() {
		if (!selectionBox) return;
		const point = contentPoint(paneElement, selectionBox.lastClientX, selectionBox.lastClientY);
		selectionBox = { ...selectionBox, currentX: point.x, currentY: point.y };
		updateMarqueeSelection(selectionBox);
	}

	function startMarqueeSelection(event: PointerEvent) {
		if (currentView !== 'home' || event.button !== 0) return;
		const target = event.target instanceof Element ? event.target : null;
		if (target?.closest('button, input, [data-no-marquee]')) return;
		selectionBase = event.ctrlKey || event.metaKey ? new Set(selectedPaths) : new Set();
		const point = contentPoint(paneElement, event.clientX, event.clientY);
		selectionBox = {
			pointerId: event.pointerId,
			startX: point.x,
			startY: point.y,
			currentX: point.x,
			currentY: point.y,
			lastClientX: event.clientX,
			lastClientY: event.clientY
		};
		onSelectRange([...selectionBase]);
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		event.preventDefault();
	}

	function moveMarqueeSelection(event: PointerEvent) {
		if (!selectionBox || selectionBox.pointerId !== event.pointerId) return;
		const point = contentPoint(paneElement, event.clientX, event.clientY);
		selectionBox = {
			...selectionBox,
			currentX: point.x,
			currentY: point.y,
			lastClientX: event.clientX,
			lastClientY: event.clientY
		};
		updateMarqueeSelection(selectionBox);
	}

	function endMarqueeSelection(event: PointerEvent) {
		if (!selectionBox || selectionBox.pointerId !== event.pointerId) return;
		const point = contentPoint(paneElement, event.clientX, event.clientY);
		selectionBox = {
			...selectionBox,
			currentX: point.x,
			currentY: point.y,
			lastClientX: event.clientX,
			lastClientY: event.clientY
		};
		updateMarqueeSelection(selectionBox);
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		selectionBox = null;
	}
</script>

<svelte:window
	onpointermove={moveEntryPointerDrag}
	onpointerup={endEntryPointerDrag}
	onpointercancel={cancelEntryPointerDrag}
/>

{#snippet driveTile(drive: DriveInfo)}
	{@const ejecting = driveEjecting(drive)}
	<div
		class={[
			'drive-tile',
			ejecting ? 'opacity-60' : '',
			dropTargetKey === driveDropKey(drive.mount_point) ? 'drop-target-entry' : ''
		]}
		role="group"
		ondragover={(event) => !ejecting && onPathDragOver(event, drive.mount_point, driveDropKey(drive.mount_point))}
		ondragleave={onDragLeave}
		ondrop={(event) => !ejecting && onDrop(event, drive.mount_point)}
		data-drop-path={ejecting ? undefined : drive.mount_point}
		data-drop-key={ejecting ? undefined : driveDropKey(drive.mount_point)}
	>
		<button
			class="drive-open w-full text-left"
			type="button"
			disabled={ejecting}
			onclick={() => onNavigate(drive.mount_point)}
			onauxclick={(event) => openDriveWithMiddleClick(event, drive)}
		>
			<div class="flex items-center gap-3">
				<div class="grid h-10 w-10 place-items-center rounded-full bg-[var(--control)] text-[var(--text-soft)]">
					<Icon name={ejecting ? 'refresh' : driveIcon(drive)} size={20} class={ejecting ? 'animate-spin' : ''} />
				</div>
				<div class="min-w-0">
					<div class="truncate text-[14px] font-medium text-[var(--text)]">{drive.name}</div>
					<div class="truncate text-[12px] text-[var(--text-muted)]">{ejecting ? 'Ejecting' : drive.mount_point}</div>
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
	</div>
{/snippet}

<section
	bind:this={paneElement}
	class="soft-scroll relative min-h-0 flex-1 overflow-auto px-5 pb-2"
	aria-label="File browser"
	tabindex="-1"
	data-drop-path={currentPath}
	data-drop-key={paneDropKey(currentPath)}
	onpointerdown={startMarqueeSelection}
	onpointermove={moveMarqueeSelection}
	onpointerup={endMarqueeSelection}
	onpointercancel={endMarqueeSelection}
	onscroll={refreshMarqueeAfterScroll}
	oncontextmenu={(event) => onContextMenu(event)}
	ondragover={(event) => onDragOver(event, undefined, paneDropKey(currentPath))}
	ondrop={(event) => onDrop(event, currentPath)}
>
	{#if selectionBox}
		<div class="selection-marquee" style={selectionBoxStyle(selectionBox)}></div>
	{/if}

	{#if showLoadingSkeleton}
		<div class="loading-skeleton grid gap-2 pt-2">
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
		{#if drives.length === 0}
			<div class="empty-pane">
				<Icon name="hard-drive" size={42} />
				<p>No drives mounted</p>
			</div>
		{:else}
			<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 pb-4 pt-2">
				{#each internalDrives as drive (drive.mount_point)}
					{@render driveTile(drive)}
				{/each}
				{#if internalDrives.length > 0 && externalDrives.length > 0}
					<div class="col-span-full my-1 h-px bg-[var(--hairline)]"></div>
				{/if}
				{#each externalDrives as drive (drive.mount_point)}
					{@render driveTile(drive)}
				{/each}
			</div>
		{/if}
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
						mode="create"
						itemType={draft.itemType}
						placeholder={draft.itemType === 'folder' ? 'New folder' : 'New file.txt'}
						onInput={onDraftInput}
						onConfirm={onDraftConfirm}
						onCancel={onDraftCancel}
					/>
				</div>
			{/if}
			{#each paneEntries as entry, index (entry.path)}
				{@const status = vcsStatus(entry)}
				{#if isRenaming(entry)}
					<div class={['grid-tile', ...entryState(entry)]} style:animation-delay={itemDelay(index)}>
						<EntryIcon name={entryIcon(entry)} density="grid" thumbnail={thumbnailFor(entry)} />
						<InlineNameField
							class="inline-name-field--grid"
							value={draft?.value ?? ''}
							label="File name"
							mode="rename"
							originalName={entry.name}
							itemType={entry.is_dir ? 'folder' : 'file'}
							selectNameOnly
							onInput={onDraftInput}
							onConfirm={onDraftConfirm}
							onCancel={onDraftCancel}
						/>
					</div>
				{:else}
					<button
						class={['grid-tile', 'relative', ...entryState(entry)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={false}
						data-drop-path={entry.is_dir ? entry.path : undefined}
						data-drop-key={entry.is_dir ? entryDropKey(entry.path) : undefined}
						onclick={(event) => selectEntry(entry, event)}
						ondblclick={() => onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						onpointerdown={(event) => startEntryPointerDrag(event, entry)}
						ondragover={(event) => onDragOver(event, entry, entry.is_dir ? entryDropKey(entry.path) : undefined)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<EntryIcon name={entryIcon(entry)} density="grid" thumbnail={thumbnailFor(entry)} />
						<VcsBadge {status} density="grid" />
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
							mode="create"
							itemType={draft.itemType}
							placeholder={draft.itemType === 'folder' ? 'New folder' : 'New file.txt'}
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
			{#each paneEntries as entry, index (entry.path)}
				{@const status = vcsStatus(entry)}
				{#if isRenaming(entry)}
					<div class={['table-row', ...entryState(entry)]} style:animation-delay={itemDelay(index)}>
						<span class="flex min-w-0 items-center gap-3">
							<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
							<InlineNameField
								value={draft?.value ?? ''}
								label="File name"
								mode="rename"
								originalName={entry.name}
								itemType={entry.is_dir ? 'folder' : 'file'}
								selectNameOnly
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
						class={['table-row', ...entryState(entry)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={false}
						data-drop-path={entry.is_dir ? entry.path : undefined}
						data-drop-key={entry.is_dir ? entryDropKey(entry.path) : undefined}
						onclick={(event) => selectEntry(entry, event)}
						ondblclick={() => onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						onpointerdown={(event) => startEntryPointerDrag(event, entry)}
						ondragover={(event) => onDragOver(event, entry, entry.is_dir ? entryDropKey(entry.path) : undefined)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<span class="flex min-w-0 items-center gap-3">
							<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
							<span class="truncate">{entry.name}</span>
							<VcsBadge {status} />
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
						mode="create"
						itemType={draft.itemType}
						placeholder={draft.itemType === 'folder' ? 'New folder' : 'New file.txt'}
						onInput={onDraftInput}
						onConfirm={onDraftConfirm}
						onCancel={onDraftCancel}
					/>
				</div>
			{/if}
			{#each paneEntries as entry, index (entry.path)}
				{@const status = vcsStatus(entry)}
				{#if isRenaming(entry)}
					<div class={['file-row', ...entryState(entry)]} style:animation-delay={itemDelay(index)}>
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
						<InlineNameField
							value={draft?.value ?? ''}
							label="File name"
							mode="rename"
							originalName={entry.name}
							itemType={entry.is_dir ? 'folder' : 'file'}
							selectNameOnly
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
						class={['file-row', ...entryState(entry)]}
						data-entry-path={entry.path}
						style:animation-delay={itemDelay(index)}
						type="button"
						draggable={false}
						data-drop-path={entry.is_dir ? entry.path : undefined}
						data-drop-key={entry.is_dir ? entryDropKey(entry.path) : undefined}
						onclick={(event) => selectEntry(entry, event)}
						ondblclick={() => onOpenEntry(entry)}
						onauxclick={(event) => onMiddleClick(entry, event)}
						oncontextmenu={(event) => onContextMenu(event, entry)}
						onpointerdown={(event) => startEntryPointerDrag(event, entry)}
						ondragover={(event) => onDragOver(event, entry, entry.is_dir ? entryDropKey(entry.path) : undefined)}
						ondragleave={onDragLeave}
						ondrop={(event) => entry.is_dir && onDrop(event, entry.path)}
					>
						<EntryIcon name={entryIcon(entry)} thumbnail={thumbnailFor(entry)} />
						<span class="min-w-0 flex-1 truncate text-[14px]">{entry.name}{entry.is_dir ? '/' : ''}</span>
						<VcsBadge {status} />
						<span class="w-[96px] shrink-0 text-right text-[12px] text-[var(--text-muted)]">
							{entry.is_dir ? '' : formatBytes(entry.size)}
						</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</section>

{#if pointerDrag?.started}
	<DragBundle
		entries={pointerDrag.entries}
		{thumbnails}
		x={pointerDrag.currentX}
		y={pointerDrag.currentY}
		copy={pointerDrag.copy}
	/>
{/if}

<style>
	.loading-skeleton {
		animation: skeleton-enter 180ms cubic-bezier(0.2, 0, 0, 1) both;
	}

	@keyframes skeleton-enter {
		from { opacity: 0; }
		to { opacity: 1; }
	}
</style>
