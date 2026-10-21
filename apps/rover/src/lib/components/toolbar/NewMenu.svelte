<script lang="ts">
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import Plus from '@lucide/svelte/icons/plus';
	import { MenuButton, MenuItem, tooltip } from '@luft/ui';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';

	interface Props {
		manager: FileManager;
	}

	let { manager }: Props = $props();

	function create(itemType: 'file' | 'folder', close: () => void) {
		close();
		manager.startCreate(itemType);
	}
</script>

<MenuButton label="New" class="icon-button" align="end" {@attach tooltip('New')}>
	{#snippet trigger()}
		<Plus size={18} />
	{/snippet}
	{#snippet children(close)}
		<MenuItem onclick={() => create('folder', close)}>
			<FolderPlus size={16} />
			<span class="flex-1">New folder</span>
			<span class="menu-shortcut">Ctrl+Shift+N</span>
		</MenuItem>
		<MenuItem onclick={() => create('file', close)}>
			<FilePlus size={16} />
			<span class="flex-1">New file</span>
		</MenuItem>
	{/snippet}
</MenuButton>
