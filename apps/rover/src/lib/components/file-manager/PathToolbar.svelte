<script lang="ts">
	import { tick } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import type { SortBy, ViewMode } from '$lib/types';
	import { projectSummary } from '$lib/vcs/format';
	import type { VcsProject } from '$lib/vcs/types';

	interface PathSegment {
		name: string;
		path: string;
	}

	interface Props {
		pathSegments: PathSegment[];
		currentPath: string;
		homePath: string | null;
		canGoBack: boolean;
		canGoForward: boolean;
		selectedCount: number;
		hasClipboard: boolean;
		viewMode: ViewMode;
		sortBy: SortBy;
		sortAsc: boolean;
		showHidden: boolean;
		dropTargetKey?: string | null;
		canDropOnPath?: (path: string) => boolean;
		vcsProject?: VcsProject | null;
		chooserMode?: boolean;
		onBack: () => void;
		onForward: () => void;
		onUp: () => void;
		onNavigate: (path: string) => void;
		onCreate: (type: 'file' | 'folder') => void;
		onCut: () => void;
		onCopy: () => void;
		onPaste: () => void;
		onTrash: () => void;
		onToggleHidden: () => void;
		onSort: (sort: SortBy) => void;
		onViewMode: (mode: ViewMode) => void;
		onOpenVcs?: () => void;
		onPathDragOver?: (event: DragEvent, path: string) => boolean;
		onPathDrop?: (event: DragEvent, path: string) => void;
		onPathDragLeave?: () => void;
	}

	let {
		pathSegments,
		currentPath,
		homePath,
		canGoBack,
		canGoForward,
		selectedCount,
		hasClipboard,
		viewMode,
		sortBy,
		sortAsc,
		showHidden,
		dropTargetKey = null,
		canDropOnPath = () => true,
		vcsProject = null,
		chooserMode = false,
		onBack,
		onForward,
		onUp,
		onNavigate,
		onCreate,
		onCut,
		onCopy,
		onPaste,
		onTrash,
		onToggleHidden,
		onSort,
		onViewMode,
		onOpenVcs,
		onPathDragOver,
		onPathDrop,
		onPathDragLeave
	}: Props = $props();

	let showSortMenu = $state(false);
	let isPathEditing = $state(false);
	let pathValue = $state('');
	let pathInput = $state<HTMLInputElement>();

	const sortItems = [
		{ value: 'name', label: 'Name' },
		{ value: 'date', label: 'Modified' },
		{ value: 'size', label: 'Size' },
		{ value: 'type', label: 'Type' }
	] as const;

	const viewItems = [
		{ value: 'list', label: 'List', icon: 'list' },
		{ value: 'grid', label: 'Grid', icon: 'grid' },
		{ value: 'columns', label: 'Table', icon: 'columns' }
	] as const;

	function iconButton(disabled = false) {
		return [
			'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition-[background-color,color,transform,opacity] duration-150',
			disabled
				? 'cursor-default opacity-35'
				: 'hover:bg-[var(--surface-soft)] hover:text-[var(--text)] active:scale-[0.96]'
		];
	}

	function dropKeyForPath(path: string) {
		return `pathbar:${path}`;
	}

	async function startPathEdit() {
		pathValue = currentPath || homePath || '/';
		isPathEditing = true;
		await tick();
		pathInput?.focus();
		pathInput?.select();
	}

	function commitPathEdit() {
		if (!isPathEditing) return;
		isPathEditing = false;
		const nextPath = pathValue.trim();
		if (nextPath && nextPath !== currentPath) onNavigate(nextPath);
	}

	function cancelPathEdit() {
		isPathEditing = false;
		pathValue = '';
	}

	function handlePathKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			event.stopPropagation();
			commitPathEdit();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			cancelPathEdit();
		} else if (event.key === 'F2' || event.code === 'F2') {
			event.preventDefault();
			event.stopPropagation();
		}
	}

	function navigateSegment(event: MouseEvent, path: string) {
		event.stopPropagation();
		if (path !== currentPath) onNavigate(path);
	}

	function segmentDropClasses(path: string) {
		return dropTargetKey === dropKeyForPath(path) ? 'path-segment--drop' : '';
	}

	function handleSegmentDragOver(event: DragEvent, path: string) {
		if (!onPathDragOver) return;
		if (!canDropOnPath(path)) return;
		onPathDragOver(event, path);
	}

	function handleSegmentDrop(event: DragEvent, path: string) {
		if (!onPathDrop) return;
		if (!canDropOnPath(path)) return;
		event.preventDefault();
		event.stopPropagation();
		onPathDrop(event, path);
	}
</script>

<svelte:window onclick={() => (showSortMenu = false)} />

<div class="flex shrink-0 flex-col gap-2 px-5 pb-3" data-no-drag>
	<div class="flex min-h-10 items-center gap-2">
		<button class={iconButton(!canGoBack)} type="button" aria-label="Back" disabled={!canGoBack} onclick={onBack}>
			<Icon name="arrow-left" size={18} />
		</button>
		<button
			class={iconButton(!canGoForward)}
			type="button"
			aria-label="Forward"
			disabled={!canGoForward}
			onclick={onForward}
		>
			<Icon name="arrow-right" size={18} />
		</button>
		<button class={iconButton(false)} type="button" aria-label="Parent folder" onclick={onUp}>
			<Icon name="chevron-up" size={18} />
		</button>

		{#if isPathEditing}
			<div
				class="path-bar flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--control)] px-2 py-1 text-[15px] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)]"
			>
				<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full">
					<Icon name="home" size={16} />
				</span>
				<Icon name="chevron-right" size={15} />
				<input
					bind:this={pathInput}
					class="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--text)] outline-none"
					value={pathValue}
					aria-label="Current path"
					spellcheck="false"
					oninput={(event) => (pathValue = event.currentTarget.value)}
					onkeydown={handlePathKeydown}
					onblur={commitPathEdit}
				/>
			</div>
		{:else}
			<div
				class="path-bar flex h-10 min-w-0 flex-1 items-center gap-1 rounded-full bg-[var(--control)] px-2 py-1 text-[15px] text-[var(--text-soft)] shadow-[inset_0_1px_0_var(--hairline)] transition-[background-color,color] duration-150 hover:bg-[var(--control-hover)]"
				aria-label="Current path"
				role="group"
			>
				{#if homePath}
					<button
						class={['path-segment', segmentDropClasses(homePath)]}
						type="button"
						aria-label="Home folder"
						data-drop-path={canDropOnPath(homePath) ? homePath : undefined}
						data-drop-key={canDropOnPath(homePath) ? dropKeyForPath(homePath) : undefined}
						ondragover={(event) => handleSegmentDragOver(event, homePath)}
						ondragleave={onPathDragLeave}
						ondrop={(event) => handleSegmentDrop(event, homePath)}
						onclick={(event) => navigateSegment(event, homePath)}
					>
						<Icon name="home" size={16} />
					</button>
				{/if}
				{#each pathSegments as segment (segment.path)}
					<span class="path-segment__separator" aria-hidden="true">
						<Icon name="chevron-right" size={15} />
					</span>
					<button
						class={['path-segment', segmentDropClasses(segment.path)]}
						type="button"
						data-drop-path={canDropOnPath(segment.path) ? segment.path : undefined}
						data-drop-key={canDropOnPath(segment.path) ? dropKeyForPath(segment.path) : undefined}
						ondragover={(event) => handleSegmentDragOver(event, segment.path)}
						ondragleave={onPathDragLeave}
						ondrop={(event) => handleSegmentDrop(event, segment.path)}
						onclick={(event) => navigateSegment(event, segment.path)}
					>
						<span class="path-segment__label">{segment.name}</span>
					</button>
				{/each}
				<button class="path-segment path-segment--ghost flex-1" type="button" aria-label="Edit path" onclick={startPathEdit}>
					<span class="truncate opacity-0">Current folder</span>
				</button>
			</div>
		{/if}
	</div>

	<div class="flex min-h-10 items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-1">
			{#if !chooserMode}
				<button class="command-button" type="button" onclick={() => onCreate('folder')}>
					<Icon name="folder-plus" size={16} />
					<span>New folder</span>
				</button>
				<button class="tool-button" type="button" aria-label="New file" onclick={() => onCreate('file')}>
					<Icon name="file-plus" size={16} />
				</button>
				<div class="mx-1 h-5 w-px bg-[var(--hairline)]"></div>
				<button class="tool-button" type="button" aria-label="Cut" disabled={selectedCount === 0} onclick={onCut}>
					<Icon name="scissors" size={16} />
				</button>
				<button class="tool-button" type="button" aria-label="Copy" disabled={selectedCount === 0} onclick={onCopy}>
					<Icon name="copy" size={16} />
				</button>
				<button class="tool-button" type="button" aria-label="Paste" disabled={!hasClipboard} onclick={onPaste}>
					<Icon name="clipboard" size={16} />
				</button>
				<button class="tool-button" type="button" aria-label="Move to trash" disabled={selectedCount === 0} onclick={onTrash}>
					<Icon name="trash-2" size={16} />
				</button>
				<button
					class={['tool-button', showHidden ? 'bg-[var(--sidebar-active)] text-[var(--text)]' : '']}
					type="button"
					aria-pressed={showHidden}
					aria-label={showHidden ? 'Hide hidden files' : 'Show hidden files'}
					onclick={onToggleHidden}
				>
					<Icon name={showHidden ? 'eye' : 'eye-off'} size={16} />
				</button>
			{/if}
		</div>

		<div class="flex shrink-0 items-center gap-1">
			{#if vcsProject && onOpenVcs}
				<button class="command-button max-w-[280px]" type="button" onclick={onOpenVcs}>
					<Icon name="code" size={16} />
					<span class="truncate">{projectSummary(vcsProject)}</span>
				</button>
			{/if}

			<div class="relative">
				<button
					class="command-button"
					type="button"
					onclick={(event) => {
						event.stopPropagation();
						showSortMenu = !showSortMenu;
					}}
				>
					<Icon name={sortAsc ? 'sort-asc' : 'sort-desc'} size={16} />
					<span>{sortItems.find((item) => item.value === sortBy)?.label}</span>
				</button>
				{#if showSortMenu}
					<div
						class="absolute right-0 top-[calc(100%+6px)] z-50 w-[156px] rounded-[18px] bg-[var(--surface)] p-1 shadow-[0_18px_50px_var(--shadow-soft),inset_0_1px_0_var(--hairline)]"
						role="menu"
					>
						{#each sortItems as item (item.value)}
							<button
								class={[
									'flex h-9 w-full items-center justify-between rounded-full px-3 text-left text-[13px] transition-[background-color,color] duration-150 hover:bg-[var(--surface-soft)]',
									sortBy === item.value ? 'text-[var(--text)]' : 'text-[var(--text-soft)]'
								]}
								type="button"
								role="menuitem"
								onclick={() => {
									onSort(item.value);
									showSortMenu = false;
								}}
							>
								<span>{item.label}</span>
								{#if sortBy === item.value}
									<Icon name={sortAsc ? 'sort-asc' : 'sort-desc'} size={14} />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

		<div class="flex rounded-full bg-[var(--control)] p-1 shadow-[inset_0_1px_0_var(--hairline)]">
			{#each viewItems as item (item.value)}
				<button
					class={[
						'grid h-8 w-8 place-items-center rounded-full transition-[background-color,color,transform] duration-150 active:scale-[0.96]',
						viewMode === item.value
							? 'bg-[var(--surface)] text-[var(--text)] shadow-[0_1px_2px_var(--shadow-faint)]'
							: 'text-[var(--text-muted)] hover:text-[var(--text)]'
					]}
					type="button"
					aria-label={item.label}
					onclick={() => onViewMode(item.value)}
				>
					<Icon name={item.icon} size={16} />
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.path-segment {
		display: inline-grid;
		min-height: 32px;
		align-items: center;
		grid-auto-flow: column;
		gap: 6px;
		padding-inline: 10px;
		border-radius: 999px;
		color: var(--text-soft);
		font-size: 14px;
		transition:
			background-color 160ms cubic-bezier(0.2, 0, 0, 1),
			color 160ms cubic-bezier(0.2, 0, 0, 1),
			box-shadow 160ms cubic-bezier(0.2, 0, 0, 1),
			transform 160ms cubic-bezier(0.2, 0, 0, 1);
	}

	.path-segment:hover:not(.path-segment--ghost):not(.path-segment--drop) {
		background: var(--surface-soft);
		color: var(--text);
	}

	.path-segment:active:not(.path-segment--ghost) {
		transform: scale(0.97);
	}

	.path-segment--drop,
	.path-segment--drop:hover {
		background: rgba(200, 182, 111, 0.22);
		color: var(--text);
		box-shadow:
			inset 0 0 0 1.5px rgba(200, 182, 111, 0.7),
			inset 0 1px 0 var(--hairline);
		transform: translateY(-1px);
	}

	.path-segment--drop .path-segment__label {
		color: var(--text);
		font-weight: 600;
		text-shadow: 0 0 0 currentColor;
	}

	.path-segment--ghost {
		min-width: 0;
		justify-items: start;
		padding-inline: 8px;
		opacity: 0;
	}

	.path-segment--ghost:hover {
		opacity: 1;
		background: var(--surface-soft);
		color: var(--text);
	}

	.path-segment__label {
		display: block;
		max-width: 180px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.path-segment__separator {
		display: inline-grid;
		place-items: center;
		color: var(--text-muted);
		opacity: 0.55;
	}
</style>
</div>
