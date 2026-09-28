<script lang="ts">
	import { MenuButton, MenuItem, tooltip } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import type { FileManager } from '$lib/file-manager/manager.svelte';

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
		<Icon name="plus" size={18} />
	{/snippet}
	{#snippet children(close)}
		<MenuItem onclick={() => create('folder', close)}>
			<Icon name="folder-plus" size={16} />
			<span class="flex-1">New folder</span>
			<span class="menu-shortcut">Ctrl+Shift+N</span>
		</MenuItem>
		<MenuItem onclick={() => create('file', close)}>
			<Icon name="file-plus" size={16} />
			<span class="flex-1">New file</span>
		</MenuItem>
	{/snippet}
</MenuButton>
