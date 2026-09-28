<script lang="ts">
	import { WindowControls } from '@luft/ui';
	import Icon from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { tabDropKey } from '$lib/file-manager/drag/drop-targets';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { Tab } from '$lib/types';

	interface Props {
		manager: FileManager;
		drag: DragController;
	}

	let { manager, drag }: Props = $props();

	const VIEW_ICONS = { drives: 'hard-drive', favorites: 'star', trash: 'trash' } as const;

	function tabIcon(tab: Tab) {
		if (tab.view !== 'home') return VIEW_ICONS[tab.view];
		return tab.path === manager.homePath ? 'home' : null;
	}

	function closeOnMiddleClick(event: MouseEvent, id: string) {
		if (event.button !== 1) return;
		event.preventDefault();
		manager.closeTab(id);
	}

	function leaveTab(event: DragEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof HTMLElement && event.currentTarget.contains(next)) return;
		drag.leave();
	}
</script>

<header
	class="drag-region flex h-[52px] shrink-0 items-center justify-between gap-4 px-4"
	aria-label="Window and tab controls"
>
	<div class="flex min-w-0 flex-1 items-center gap-1">
		{#each manager.tabs.list as tab (tab.id)}
			{@const icon = tabIcon(tab)}
			<div
				class={[
					'group flex h-9 max-w-[210px] items-center gap-1 rounded-full px-2 transition-[background-color,color,opacity] duration-150',
					drag.target?.key === tabDropKey(tab.id)
						? 'bg-[rgba(200,182,111,0.16)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
						: manager.tabs.activeId === tab.id
							? 'bg-[var(--control)] text-[var(--text)] shadow-[inset_0_1px_0_var(--hairline)]'
							: 'text-[var(--text-muted)] opacity-75 hover:bg-[var(--surface-hover)] hover:text-[var(--text)] hover:opacity-100'
				]}
				role="group"
				ondragover={(event) => drag.overTab(event, tab)}
				ondragleave={leaveTab}
				ondrop={(event) => drag.dropOnTab(event, tab)}
				data-drop-path={tab.view === 'home' ? tab.path : undefined}
				data-drop-key={tabDropKey(tab.id)}
				data-drop-tab-id={tab.id}
				data-drop-trash={tab.view === 'trash' ? '' : undefined}
			>
				<button
					class="flex min-w-0 flex-1 items-center gap-2 rounded-full px-1 text-[14px] outline-none"
					type="button"
					onclick={() => manager.switchTab(tab.id)}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					{#if icon}
						<Icon name={icon} size={15} />
					{/if}
					<span class="truncate">{tab.title}</span>
				</button>
				<button
					class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] opacity-0 transition-[background-color,color,opacity,transform] duration-150 hover:bg-[var(--sidebar-active)] hover:text-[var(--text)] group-hover:opacity-100 active:scale-[0.96]"
					type="button"
					aria-label="Close tab"
					onclick={(event) => {
						event.stopPropagation();
						manager.closeTab(tab.id);
					}}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					<Icon name="x" size={13} />
				</button>
			</div>
		{/each}

		<button
			class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition-[background-color,color,transform] duration-150 hover:bg-[var(--surface-hover)] hover:text-[var(--text)] active:scale-[0.96]"
			type="button"
			aria-label="New tab"
			onclick={() => manager.openTab()}
		>
			<Icon name="plus" size={16} />
		</button>
	</div>

	<WindowControls />
</header>
