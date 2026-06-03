<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { FileEntry } from '$lib/types';

	interface MenuState {
		x: number;
		y: number;
		target: FileEntry | null;
	}

	interface Props {
		menu: MenuState;
		hasClipboard: boolean;
		isFavorite: boolean;
		isPinned: boolean;
		onOpen: (entry: FileEntry) => void;
		onOpenInTab: (entry: FileEntry) => void;
		onCut: () => void;
		onCopy: () => void;
		onRename: (entry: FileEntry) => void;
		onTrash: () => void;
		onToggleFavorite: (entry: FileEntry) => void;
		onTogglePinned: (entry: FileEntry) => void;
		onCreate: (type: 'file' | 'folder') => void;
		onPaste: () => void;
		onClose: () => void;
	}

	let {
		menu,
		hasClipboard,
		isFavorite,
		isPinned,
		onOpen,
		onOpenInTab,
		onCut,
		onCopy,
		onRename,
		onTrash,
		onToggleFavorite,
		onTogglePinned,
		onCreate,
		onPaste,
		onClose
	}: Props = $props();

	function run(action: () => void) {
		action();
		onClose();
	}
</script>

<div
	class="fixed z-[80] w-[196px] rounded-[18px] bg-[var(--surface)] p-1 shadow-[0_18px_50px_var(--shadow-soft),inset_0_1px_0_var(--hairline)]"
	style:left={`${menu.x}px`}
	style:top={`${menu.y}px`}
	role="menu"
	tabindex="-1"
	onkeydown={(event) => event.key === 'Escape' && onClose()}
	onclick={(event) => event.stopPropagation()}
>
	{#if menu.target}
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onOpen(menu.target!))}>
			<Icon name="external-link" size={16} />
			<span>Open</span>
		</button>
		{#if menu.target.is_dir}
			<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onOpenInTab(menu.target!))}>
				<Icon name="plus" size={16} />
				<span>Open in tab</span>
			</button>
		{/if}
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onToggleFavorite(menu.target!))}>
			<Icon name={isFavorite ? 'check' : 'star'} size={16} />
			<span>{isFavorite ? 'Remove favorite' : 'Add favorite'}</span>
		</button>
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onTogglePinned(menu.target!))}>
			<Icon name={isPinned ? 'check' : 'pin'} size={16} />
			<span>{isPinned ? 'Remove from sidebar' : 'Pin to sidebar'}</span>
		</button>
		<div class="my-1 h-px bg-[var(--hairline)]"></div>
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(onCut)}>
			<Icon name="scissors" size={16} />
			<span>Cut</span>
		</button>
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(onCopy)}>
			<Icon name="copy" size={16} />
			<span>Copy</span>
		</button>
		<div class="my-1 h-px bg-[var(--hairline)]"></div>
		<button class="menu-item" type="button" role="menuitem" onclick={() => onRename(menu.target!)}>
			<Icon name="edit" size={16} />
			<span>Rename</span>
		</button>
		<button class="menu-item text-[var(--danger)]" type="button" role="menuitem" onclick={() => run(onTrash)}>
			<Icon name="trash-2" size={16} />
			<span>Move to trash</span>
		</button>
	{:else}
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onCreate('folder'))}>
			<Icon name="folder-plus" size={16} />
			<span>New folder</span>
		</button>
		<button class="menu-item" type="button" role="menuitem" onclick={() => run(() => onCreate('file'))}>
			<Icon name="file-plus" size={16} />
			<span>New file</span>
		</button>
		<div class="my-1 h-px bg-[var(--hairline)]"></div>
		<button class="menu-item" type="button" role="menuitem" disabled={!hasClipboard} onclick={() => run(onPaste)}>
			<Icon name="clipboard" size={16} />
			<span>Paste</span>
		</button>
	{/if}
</div>
