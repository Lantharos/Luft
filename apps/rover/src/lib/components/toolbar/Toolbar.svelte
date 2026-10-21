<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import LayoutGrid from '@lucide/svelte/icons/layout-grid';
	import List from '@lucide/svelte/icons/list';
	import PanelRight from '@lucide/svelte/icons/panel-right';
	import { Segmented, tooltip, WindowControls } from '@luft/ui';
	import type { Component } from 'svelte';
	import type { DragController } from '#lib/file-manager/drag/controller.svelte.js';
	import type { FileManager } from '#lib/file-manager/manager.svelte.js';
	import type { ViewState } from '#lib/file-manager/view/view-state.svelte.js';
	import type { ViewMode } from '#lib/types/index.js';
	import type { VcsState } from '#lib/vcs/state.svelte.js';
	import MoreMenu from './MoreMenu.svelte';
	import NewMenu from './NewMenu.svelte';
	import PathBar from './PathBar.svelte';
	import SortMenu from './SortMenu.svelte';

	interface Props {
		manager: FileManager;
		drag: DragController;
		view: ViewState;
		vcs: VcsState;
		chooser: boolean;
	}

	let { manager, drag, view, vcs, chooser }: Props = $props();

	const VIEW_MODES: { value: ViewMode; label: string; icon: Component }[] = [
		{ value: 'list', label: 'List', icon: List },
		{ value: 'grid', label: 'Grid', icon: LayoutGrid },
		{ value: 'columns', label: 'Columns', icon: Columns3 }
	];
	const MODE_ICONS = Object.fromEntries(VIEW_MODES.map((mode) => [mode.value, mode.icon])) as Record<ViewMode, Component>;

	let browsing = $derived(manager.view === 'home');
</script>

<header class="toolbar drag-region">
	<div class="flex shrink-0 items-center gap-0.5">
		<button class="icon-button" type="button" aria-label="Back" disabled={!manager.tabs.canGoBack} onclick={manager.goBack} {@attach tooltip('Back')}>
			<ChevronLeft size={19} />
		</button>
		<button
			class="icon-button"
			type="button"
			aria-label="Forward"
			disabled={!manager.tabs.canGoForward}
			onclick={manager.goForward}
			{@attach tooltip('Forward')}
		>
			<ChevronRight size={19} />
		</button>
		<button
			class="icon-button"
			type="button"
			aria-label="Parent folder"
			disabled={!browsing || manager.currentPath === '/'}
			onclick={manager.goUp}
			{@attach tooltip('Parent folder')}
		>
			<ArrowUp size={17} />
		</button>
	</div>

	<PathBar {manager} {drag} {view} acceptsDrops={!chooser} />

	<div class="flex shrink-0 items-center gap-1" data-no-drag>
		{#if vcs.project && browsing}
			<button
				class={['vcs-chip', vcs.panelOpen && 'is-on']}
				type="button"
				onclick={() => (vcs.panelOpen = !vcs.panelOpen)}
				{@attach tooltip('Changes')}
			>
				<GitBranch size={15} />
				<span class="truncate">{vcs.project.branch ?? 'Git'}</span>
				{#if vcs.project.changedCount > 0}
					<span class="text-[var(--text-muted)]">{vcs.project.changedCount}</span>
				{/if}
			</button>
		{/if}
		{#if browsing}
			<Segmented options={VIEW_MODES} value={manager.viewMode} label="View" onchange={manager.setViewMode}>
				{#snippet item(option)}
					{@const Icon = MODE_ICONS[option.value]}
					<Icon size={16} />
				{/snippet}
			</Segmented>
			<SortMenu {manager} />
			{#if !chooser}
				<NewMenu {manager} />
			{/if}
		{/if}
		<button
			class={['icon-button', view.detailsOpen && 'is-on']}
			type="button"
			aria-label="Details"
			aria-pressed={view.detailsOpen}
			onclick={view.toggleDetails}
			{@attach tooltip('Details')}
		>
			<PanelRight size={17} />
		</button>
		<MoreMenu {manager} {view} {chooser} />
	</div>

	<WindowControls />
</header>

<style>
	.toolbar {
		display: flex;
		height: 52px;
		flex: none;
		align-items: center;
		gap: 10px;
		padding-inline: 10px 16px;
	}

	.icon-button.is-on {
		background: var(--surface-hover);
		color: var(--text);
	}

	.vcs-chip {
		display: inline-flex;
		height: 30px;
		max-width: 180px;
		align-items: center;
		gap: 6px;
		border-radius: var(--radius-pill);
		padding-inline: 10px;
		color: var(--text-soft);
		font-size: 12.5px;
		transition:
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate);
	}

	.vcs-chip:hover,
	.vcs-chip.is-on {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
