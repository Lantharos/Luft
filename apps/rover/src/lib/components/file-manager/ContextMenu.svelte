<script lang="ts">
	import { tick } from 'svelte';
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

	const viewportMargin = 10;
	let menuElement: HTMLDivElement;
	let placed = $state(false);
	let menuX = $state(0);
	let menuY = $state(0);
	let menuOrigin = $state('top left');
	let placementKey = $derived(
		`${menu.x}:${menu.y}:${menu.target?.path ?? 'pane'}:${hasClipboard}:${isFavorite}:${isPinned}`
	);

	function run(action: () => void) {
		action();
		onClose();
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), Math.max(min, max));
	}

	async function placeMenu() {
		placed = false;
		menuX = menu.x;
		menuY = menu.y;
		await tick();
		if (!menuElement) return;

		const rect = menuElement.getBoundingClientRect();
		const maxX = window.innerWidth - rect.width - viewportMargin;
		const maxY = window.innerHeight - rect.height - viewportMargin;
		const opensLeft =
			menu.x + rect.width + viewportMargin > window.innerWidth && menu.x - rect.width > viewportMargin;
		const opensUp =
			menu.y + rect.height + viewportMargin > window.innerHeight && menu.y - rect.height > viewportMargin;

		menuX = clamp(opensLeft ? menu.x - rect.width : menu.x, viewportMargin, maxX);
		menuY = clamp(opensUp ? menu.y - rect.height : menu.y, viewportMargin, maxY);
		menuOrigin = `${opensUp ? 'bottom' : 'top'} ${opensLeft ? 'right' : 'left'}`;
		placed = true;
	}

	$effect(() => {
		placementKey;
		void placeMenu();
	});
</script>

<svelte:window onresize={placeMenu} />

<div
	bind:this={menuElement}
	class={[
		'fixed z-[80] max-h-[calc(100vh-20px)] w-[196px] overflow-y-auto rounded-[18px] bg-[var(--surface)] p-1 shadow-[0_18px_50px_var(--shadow-soft),inset_0_1px_0_var(--hairline)] transition-[opacity,scale] duration-[120ms]',
		placed ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]'
	]}
	style:left={`${menuX}px`}
	style:top={`${menuY}px`}
	style:transform-origin={menuOrigin}
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
