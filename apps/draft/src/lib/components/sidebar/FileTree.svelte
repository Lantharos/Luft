<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronsDownUp from '@lucide/svelte/icons/chevrons-down-up';
	import File from '@lucide/svelte/icons/file';
	import Folder from '@lucide/svelte/icons/folder';
	import { basename, tooltip, VirtualScroller } from '@luft/ui';
	import { useApp } from '#lib/app/context.js';
	import { openPath } from '#lib/documents/opening.js';
	import { entryMenu } from '#lib/files/actions.js';
	import type { TreeRow } from '#lib/files/tree.svelte.js';

	const app = useApp();
	let workspace = $derived(app.workspace);
	let tree = $derived(workspace.tree);
	let activePath = $derived(workspace.active?.path ?? null);

	const ROW_HEIGHT = 28;
	const INDENT = 14;

	function open(row: TreeRow) {
		if (row.entry.folder) void tree.toggle(row.entry.path);
		else void openPath(workspace, row.entry.path);
	}
</script>

<section class="flex min-h-0 flex-1 flex-col gap-0.5">
	<div class="flex items-center gap-1 pr-1">
		<h2 class="sidebar-heading flex-1 truncate" title={tree.root}>{basename(tree.root ?? '')}</h2>
		<button type="button" class="tree-action" aria-label="Collapse folders" onclick={() => tree.collapseAll()} {@attach tooltip('Collapse folders')}>
			<ChevronsDownUp size={14} />
		</button>
	</div>
	<VirtualScroller class="hidden-scroll scroll-fade min-h-0 flex-1" items={tree.rows} key={(row) => row.entry.path} layout={{ itemHeight: ROW_HEIGHT }}>
		{#snippet children(row)}
			<button
				type="button"
				class={['tree-row', row.entry.path === activePath && 'is-active']}
				style:padding-left="{10 + row.depth * INDENT}px"
				aria-expanded={row.entry.folder ? row.expanded : undefined}
				onclick={() => open(row)}
				oncontextmenu={(event) => app.menus.open(event, entryMenu(app, row.entry.path, row.entry.folder))}
			>
				{#if row.entry.folder}
					<ChevronRight size={13} class={['chevron', row.expanded && 'open']} />
					<Folder size={15} class="tree-icon folder" />
				{:else}
					<span class="chevron-space"></span>
					<File size={15} class="tree-icon" />
				{/if}
				<span class="truncate">{row.entry.name}</span>
			</button>
		{/snippet}
	</VirtualScroller>
</section>

<style>
	.sidebar-heading {
		padding: 4px 12px;
		color: var(--sidebar-text-muted);
		font-size: 12px;
		font-weight: 500;
	}

	.tree-row {
		display: flex;
		height: 28px;
		width: 100%;
		align-items: center;
		gap: 6px;
		border-radius: var(--radius-pill);
		padding-right: 10px;
		color: var(--sidebar-text);
		font-size: 13px;
		text-align: left;
		transition: background-color 120ms var(--ease);
	}

	.tree-row:hover {
		background: var(--sidebar-control);
	}

	.tree-row.is-active {
		background: var(--sidebar-active);
		color: var(--text);
	}

	.tree-row :global(.chevron) {
		flex: none;
		color: var(--sidebar-text-muted);
		transition: transform 160ms var(--ease);
	}

	.tree-row :global(.chevron.open) {
		transform: rotate(90deg);
	}

	.chevron-space {
		width: 13px;
		flex: none;
	}

	.tree-row :global(.tree-icon) {
		flex: none;
		color: var(--sidebar-text-muted);
	}

	.tree-row :global(.tree-icon.folder) {
		color: color-mix(in oklab, var(--accent) 70%, var(--sidebar-text));
	}

	.tree-action {
		display: grid;
		height: 24px;
		width: 24px;
		place-items: center;
		border-radius: var(--radius-pill);
		color: var(--sidebar-text-muted);
		transition: background-color 140ms var(--ease), color 140ms var(--ease);
	}

	.tree-action:hover {
		background: var(--sidebar-control);
		color: var(--sidebar-text);
	}
</style>
