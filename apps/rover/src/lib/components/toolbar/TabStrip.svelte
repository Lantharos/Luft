<script lang="ts">
	import { tooltip } from '@luft/ui';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import type { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { tabDropKey } from '$lib/file-manager/drag/drop-targets';
	import type { FileManager } from '$lib/file-manager/manager.svelte';
	import type { Tab } from '$lib/types';

	interface Props {
		manager: FileManager;
		drag: DragController;
	}

	let { manager, drag }: Props = $props();

	const VIEW_ICONS: Record<'recent' | 'trash', IconName> = { recent: 'clock', trash: 'trash' };

	function tabIcon(tab: Tab): IconName {
		if (tab.view !== 'home') return VIEW_ICONS[tab.view];
		return tab.path === manager.homePath ? 'home' : 'folder';
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

{#if manager.tabs.list.length > 1}
	<div class="tab-strip" role="tablist" aria-label="Tabs">
		{#each manager.tabs.list as tab (tab.id)}
			<div
				class={['tab', manager.tabs.activeId === tab.id && 'is-active', drag.target?.key === tabDropKey(tab.id) && 'is-drop-target']}
				role="presentation"
				ondragover={(event) => drag.overTab(event, tab)}
				ondragleave={leaveTab}
				ondrop={(event) => drag.dropOnTab(event, tab)}
				data-drop-path={tab.view === 'home' ? tab.path : undefined}
				data-drop-key={tabDropKey(tab.id)}
				data-drop-tab-id={tab.id}
				data-drop-trash={tab.view === 'trash' ? '' : undefined}
			>
				<button
					class="tab-main"
					type="button"
					role="tab"
					aria-selected={manager.tabs.activeId === tab.id}
					onclick={() => manager.switchTab(tab.id)}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					<Icon name={tabIcon(tab)} size={14} />
					<span class="truncate">{tab.title}</span>
				</button>
				<button
					class="tab-close"
					type="button"
					aria-label="Close tab"
					onclick={() => manager.closeTab(tab.id)}
					onauxclick={(event) => closeOnMiddleClick(event, tab.id)}
				>
					<Icon name="x" size={12} />
				</button>
			</div>
		{/each}
		<button class="icon-button" type="button" aria-label="New tab" onclick={() => manager.openTab()} {@attach tooltip('New tab')}>
			<Icon name="plus" size={15} />
		</button>
	</div>
{/if}
