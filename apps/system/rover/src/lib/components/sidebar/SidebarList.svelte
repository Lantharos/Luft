<script lang="ts">
	import X from '@luft/symbols/icons/x';
	import { t } from '@luft/i18n';
	import { tooltip } from '@luft/ui';
	import { KIND_ICONS } from '#lib/components/pane/kind-icons.js';
	import { folderLooks } from '#lib/features/looks/looks.svelte.js';
	import type { ChooserState } from '#lib/file-manager/chooser.svelte.js';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import { dataTransferPaths } from '#lib/file-manager/drag/data-transfer.js';
	import { dropKey, TRASH_DROP_PATH } from '#lib/file-manager/drag/drop-targets.js';
	import type { FileManager, SidebarPlace } from '#lib/file-manager/manager.svelte.js';
	import type { TrashCounter } from '#lib/file-manager/places/places.svelte.js';
	import * as sidebar from '#lib/file-manager/places/sidebar.js';
	import type { SidebarRow } from '#lib/file-manager/places/sidebar.js';
	import type { FileKind } from '#lib/utils/kinds.js';
	import SidebarItem from './SidebarItem.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		chooser: ChooserState | null;
		trash: TrashCounter;
		onopentab: (event: MouseEvent, open: () => void) => void;
		onmenu: (event: MouseEvent, place: SidebarPlace) => void;
	}

	let { manager, drag, chooser, trash, onopentab, onmenu }: Props = $props();

	let receiving = $state(false);
	let moving = $state<string | null>(null);
	let insertBefore = $state<string | null>(null);

	let rows = $derived(sidebar.rows(manager.userDirs).filter((row) => !(chooser && row.entry.kind === 'place' && row.entry.place === 'trash')));
	let browsing = $derived(manager.view === 'home');

	$effect(() => {
		void folderLooks.keep(rows.flatMap((row) => (row.path && sidebar.opensFolder(row.entry) ? [row.path] : [])));
	});

	function view(row: SidebarRow) {
		return row.entry.kind === 'place' && sidebar.isView(row.entry.place) ? row.entry.place : null;
	}

	function art(row: SidebarRow) {
		if (row.entry.kind === 'place') return sidebar.placeArt(row.entry.place, manager.userDirs);
		if (!row.entry.isDir) return { icon: KIND_ICONS[row.entry.icon as FileKind] ?? KIND_ICONS.file };
		return folderLooks.art(row.path!);
	}

	function active(row: SidebarRow) {
		const shown = view(row);
		if (shown) return manager.view === shown;
		return browsing && manager.currentPath === row.path;
	}

	function dropTarget(row: SidebarRow) {
		if (view(row) === 'trash') return dropKey('sidebar', TRASH_DROP_PATH);
		return sidebar.opensFolder(row.entry) ? dropKey('sidebar', row.path!) : null;
	}

	function open(row: SidebarRow) {
		const shown = view(row);
		if (shown) return manager.showView(shown);
		if (row.entry.kind === 'pinned' && chooser) return chooser.openPinned(row.entry);
		manager.openEntry({ path: row.path!, isDir: sidebar.opensFolder(row.entry) });
	}

	function openInTab(row: SidebarRow) {
		const shown = view(row);
		if (shown) return manager.openViewInTab(shown);
		if (sidebar.opensFolder(row.entry)) return manager.openTab(row.path!);
		manager.openEntry({ path: row.path!, isDir: false });
	}

	function groupDragOver(event: DragEvent) {
		event.preventDefault();
		if (moving) {
			insertBefore = null;
			if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
			return;
		}
		receiving = true;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function groupDragLeave(event: DragEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(next)) return;
		receiving = false;
	}

	function groupDrop(event: DragEvent) {
		event.preventDefault();
		if (moving) sidebar.move(moving, null);
		else {
			const dropped = dataTransferPaths(event.dataTransfer);
			void sidebar.add(dropped.length > 0 ? dropped : drag.paths, manager.entries, manager.userDirs);
			drag.end();
		}
		finish();
	}

	function rowDragOver(event: DragEvent, row: SidebarRow) {
		if (!moving) {
			if (view(row) === 'trash') drag.overTrash(event, dropTarget(row)!);
			else if (sidebar.opensFolder(row.entry)) drag.overPath(event, row.path!, dropTarget(row)!);
			return;
		}
		if (moving === row.key) return;
		event.preventDefault();
		event.stopPropagation();
		insertBefore = row.key;
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}

	function rowDrop(event: DragEvent, row: SidebarRow) {
		if (!moving) {
			if (view(row) === 'trash') void drag.dropOnTrash(event);
			else if (sidebar.opensFolder(row.entry)) void drag.drop(event, row.path!);
			return;
		}
		if (moving === row.key) return;
		event.preventDefault();
		event.stopPropagation();
		sidebar.move(moving, row.key);
		finish();
	}

	function startMoving(event: DragEvent, key: string) {
		moving = key;
		event.dataTransfer?.setData('application/x-rover-sidebar', key);
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function finish() {
		moving = null;
		insertBefore = null;
		receiving = false;
	}
</script>

<div
	class={['sidebar-list flex flex-col gap-px', receiving && 'is-receiving']}
	role="group"
	aria-label={t('rover-sidebar-places')}
	ondragenter={groupDragOver}
	ondragover={groupDragOver}
	ondragleave={groupDragLeave}
	ondrop={groupDrop}
>
	{#each rows as row (row.key)}
		<SidebarItem
			class={insertBefore === row.key ? 'is-insert-target' : ''}
			{...art(row)}
			label={row.label}
			active={active(row)}
			dropping={drag.target?.key === dropTarget(row)}
			draggable="true"
			onclick={() => open(row)}
			onauxclick={(event) => onopentab(event, () => openInTab(row))}
			oncontextmenu={(event) => onmenu(event, { kind: 'entry', row })}
			ondragstart={(event) => startMoving(event, row.key)}
			ondragover={(event) => rowDragOver(event, row)}
			ondragleave={drag.leave}
			ondrop={(event) => rowDrop(event, row)}
			ondragend={finish}
		>
			{#snippet trailing()}
				{#if view(row) === 'trash'}
					{#if trash.count > 0}
						<span class="sidebar-item__count">{trash.count}</span>
					{/if}
				{:else if row.entry.kind === 'pinned'}
					<button
						class="sidebar-item__action is-reveal"
						type="button"
						aria-label={t('rover-sidebar-remove-named', { name: row.label })}
						onclick={() => sidebar.remove(row.key)}
						{@attach tooltip(t('rover-menu-remove-from-sidebar'))}
					>
						<X size={14} />
					</button>
				{/if}
			{/snippet}
		</SidebarItem>
	{/each}
	{#if receiving && !moving}
		<p class="sidebar-hint">{t('rover-sidebar-drop')}</p>
	{/if}
</div>

<style>
	.sidebar-list {
		min-height: 36px;
		flex: 1 0 auto;
		border-radius: 14px;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			box-shadow var(--motion-tap) var(--ease-decelerate);
	}

	.sidebar-list.is-receiving {
		background: var(--sidebar-control);
		box-shadow: inset 0 0 0 1px var(--accent-line);
	}

	.sidebar-hint {
		padding: 8px 12px;
		color: var(--sidebar-text-muted);
		font-size: 12.5px;
	}

	.sidebar-item__count {
		margin-right: 14px;
		color: var(--sidebar-text-muted);
		font-size: 12px;
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
</style>
