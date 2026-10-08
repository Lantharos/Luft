<script lang="ts">
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import Search from '@lucide/svelte/icons/search';
	import { useApp } from '#lib/app/context.js';
	import FileTree from './FileTree.svelte';

	const app = useApp();
	let workspace = $derived(app.workspace);
</script>

<aside class="glass-sidebar drag-region sidebar">
	<button type="button" class="quick-open" onclick={() => app.showQuickOpen()}>
		<Search size={15} />
		<span class="flex-1 truncate text-left">Go to file</span>
		<kbd>Ctrl P</kbd>
	</button>

	<div class="sidebar-body">
		{#if workspace.tree.root}
			<FileTree />
		{:else}
			<div class="sidebar-empty">
				<button type="button" class="open-folder" onclick={() => void app.openFolder()}>
					<FolderOpen size={16} />
					<span>Open Folder</span>
				</button>
			</div>
		{/if}
	</div>
</aside>

<style>
	.sidebar {
		gap: 10px;
		padding: 12px 8px 8px;
	}

	.quick-open {
		display: flex;
		height: 36px;
		flex: none;
		align-items: center;
		gap: 9px;
		margin-inline: 2px;
		border-radius: var(--radius-pill);
		background: var(--sidebar-control);
		padding-inline: 12px 10px;
		color: var(--sidebar-text-muted);
		font-size: 13px;
		transition: background-color 160ms var(--ease);
	}

	.quick-open:hover {
		background: var(--sidebar-control-hover);
	}

	kbd {
		font-family: inherit;
		font-size: 11.5px;
		opacity: 0.8;
	}

	.sidebar-body {
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		gap: 14px;
	}

	.sidebar-empty {
		padding: 4px 2px;
	}

	.open-folder {
		display: flex;
		height: 34px;
		width: 100%;
		align-items: center;
		gap: 10px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		color: var(--sidebar-text);
		font-size: 13px;
		transition: background-color 140ms var(--ease);
	}

	.open-folder:hover {
		background: var(--sidebar-control);
	}
</style>
