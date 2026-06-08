<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { tabDropKey } from '$lib/file-manager/drop-targets';
	import type { Tab } from '$lib/types';

	interface Props {
		tabs: Tab[];
		activeTab: Tab | null;
		homePath: string | null;
		dropTargetKey: string | null;
		onSwitchTab: (id: string) => void;
		onCloseTab: (id: string) => void;
		onOpenTab: () => void;
		onTabDragOver: (event: DragEvent, tab: Tab) => boolean;
		onTabDrop: (event: DragEvent, tab: Tab) => void;
		onTabDragLeave: () => void;
		onMinimize: () => void;
		onToggleMaximize: () => void;
		onCloseWindow: () => void;
	}

	let {
		tabs,
		activeTab,
		homePath,
		dropTargetKey,
		onSwitchTab,
		onCloseTab,
		onOpenTab,
		onTabDragOver,
		onTabDrop,
		onTabDragLeave,
		onMinimize,
		onToggleMaximize,
		onCloseWindow
	}: Props = $props();

	type TabIcon = 'home' | 'hard-drive' | 'star' | 'trash';
	let dropTabId = $state<string | null>(null);

	function tabTitle(tab: Tab) {
		if (tab.view === 'drives') return 'Drives';
		if (tab.view === 'favorites') return 'Favorites';
		if (tab.view === 'trash') return 'Trash';
		if (homePath && tab.path === homePath) return 'Home';
		return tab.title || tab.path.split('/').filter(Boolean).at(-1) || '/';
	}

	function tabIcon(tab: Tab): TabIcon | null {
		if (tab.view === 'drives') return 'hard-drive';
		if (tab.view === 'favorites') return 'star';
		if (tab.view === 'trash') return 'trash';
		if (homePath && tab.path === homePath) return 'home';
		return null;
	}

	function closeOnMiddleClick(event: MouseEvent, id: string) {
		if (event.button !== 1) return;
		event.preventDefault();
		onCloseTab(id);
	}

	function handleTabDragOver(event: DragEvent, tab: Tab) {
		if (onTabDragOver(event, tab)) dropTabId = tab.id;
	}

	function handleTabDrop(event: DragEvent, tab: Tab) {
		dropTabId = null;
		onTabDrop(event, tab);
	}

	function handleTabDragLeave(event: DragEvent, tab: Tab) {
		const nextTarget = event.relatedTarget;
		if (nextTarget instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(nextTarget)) return;
		if (dropTabId === tab.id) dropTabId = null;
		onTabDragLeave();
	}

	function tabDropPath(tab: Tab) {
		return tab.view === 'home' ? tab.path : undefined;
	}

	function tabIsDropping(tab: Tab) {
		return dropTabId === tab.id || dropTargetKey === tabDropKey(tab.id);
	}
</script>

<header
	class="drag-region flex h-[52px] shrink-0 items-center justify-between gap-4 px-4"
	role="toolbar"
	aria-label="Window and tab controls"
	tabindex="-1"
	data-window-drag
>
	<div class="flex min-w-0 flex-1 items-center gap-1">
		{#each tabs as tab (tab.id)}
			{@const icon = tabIcon(tab)}
			<div
				class={[
					'group flex h-9 max-w-[210px] items-center gap-1 rounded-full px-2 transition-[background-color,color,opacity] duration-150',
					tabIsDropping(tab)
						? 'bg-[rgba(200,182,111,0.16)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
						: activeTab?.id === tab.id
						? 'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
						: 'text-[var(--text-muted)] opacity-75 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] hover:opacity-100'
				]}
				role="group"
				ondragover={(event) => handleTabDragOver(event, tab)}
				ondragleave={(event) => handleTabDragLeave(event, tab)}
				ondrop={(event) => handleTabDrop(event, tab)}
				data-drop-path={tabDropPath(tab)}
				data-drop-key={tabDropKey(tab.id)}
				data-drop-tab-id={tab.id}
				data-drop-trash={tab.view === 'trash' ? 'true' : undefined}
			>
				<button
					class="flex min-w-0 flex-1 items-center gap-2 rounded-full px-1 text-[14px] outline-none"
					type="button"
					onclick={() => onSwitchTab(tab.id)}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					{#if icon}
						<Icon name={icon} size={15} />
					{/if}
					<span class="truncate">{tabTitle(tab)}</span>
				</button>
				<button
					class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--sidebar-active)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
					type="button"
					aria-label="Close tab"
					onclick={(event) => {
						event.stopPropagation();
						onCloseTab(tab.id);
					}}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					<Icon name="x" size={13} />
				</button>
			</div>
		{/each}

		<button
			class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] active:scale-[0.96]"
			type="button"
			aria-label="New tab"
			onclick={onOpenTab}
		>
			<Icon name="plus" size={16} />
		</button>
	</div>

	<div class="flex h-8 shrink-0 items-center gap-1">
		<button class="window-control" type="button" aria-label="Minimize" onclick={onMinimize}>
			<Icon name="minus" size={15} />
		</button>
		<button class="window-control" type="button" aria-label="Maximize" onclick={onToggleMaximize}>
			<Icon name="square" size={14} />
		</button>
		<button class="window-control" type="button" aria-label="Close" onclick={onCloseWindow}>
			<Icon name="x" size={15} />
		</button>
	</div>
</header>
