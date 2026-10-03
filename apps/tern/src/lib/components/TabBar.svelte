<script lang="ts">
	import { WindowControls, tooltip } from '@luft/ui';
	import Plus from '@lucide/svelte/icons/plus';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import X from '@lucide/svelte/icons/x';
	import type { Tab } from '#lib/workspace/tab.svelte.js';
	import type { Workspace } from '#lib/workspace/workspace.svelte.js';

	interface Props {
		workspace: Workspace;
	}

	let { workspace }: Props = $props();

	function middleClose(event: MouseEvent, tab: Tab) {
		if (event.button !== 1) return;
		event.preventDefault();
		void workspace.closeTab(tab);
	}
</script>

<header class="tab-bar drag-region">
	<div class="tab-list" role="tablist" aria-label="Tabs">
		{#each workspace.tabs as tab (tab.key)}
			<div class={['tab', tab === workspace.active && 'is-active', tab.ringing && 'is-ringing']} role="presentation">
				<button
					type="button"
					class="tab-main"
					role="tab"
					aria-selected={tab === workspace.active}
					onclick={() => workspace.select(tab)}
					onauxclick={(event) => middleClose(event, tab)}
				>
					<span class="truncate">{tab.title}</span>
				</button>
				<button type="button" class="tab-close" aria-label="Close tab" onclick={() => workspace.closeTab(tab)} onauxclick={(event) => middleClose(event, tab)}>
					<X size={12} />
				</button>
			</div>
		{/each}
		<button type="button" class="icon-button" aria-label="New tab" {@attach tooltip('New tab')} onclick={() => workspace.openTab()}>
			<Plus size={16} />
		</button>
	</div>
	<button type="button" class="icon-button" aria-label="Preferences" {@attach tooltip('Preferences')} onclick={() => (workspace.preferencesOpen = true)}>
		<SlidersHorizontal size={16} />
	</button>
	<WindowControls />
</header>
