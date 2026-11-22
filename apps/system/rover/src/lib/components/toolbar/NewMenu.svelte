<script lang="ts">
	import FilePlus from '@luft/symbols/icons/file-plus';
	import FolderPlus from '@luft/symbols/icons/folder-plus';
	import Plus from '@luft/symbols/icons/plus';
	import { t } from '@luft/i18n';
	import { MenuButton, MenuItem, tooltip } from '@luft/ui';
	import { shortcutLabel } from '#lib/utils/shortcuts.js';
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

<MenuButton label={t('rover-new')} class="icon-button" align="end" {@attach tooltip(t('rover-new'))}>
	{#snippet trigger()}
		<Plus size={18} />
	{/snippet}
	{#snippet children(close)}
		<MenuItem onclick={() => create('folder', close)}>
			<FolderPlus size={16} />
			<span class="flex-1">{t('rover-new-folder')}</span>
			<span class="text-[11.5px] text-[var(--text-muted)] tabular-nums">{shortcutLabel(['ctrl', 'shift'], 'N')}</span>
		</MenuItem>
		<MenuItem onclick={() => create('file', close)}>
			<FilePlus size={16} />
			<span class="flex-1">{t('rover-new-file')}</span>

		</MenuItem>
	{/snippet}
</MenuButton>
