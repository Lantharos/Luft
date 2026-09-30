<script lang="ts">
	import { onMount } from 'svelte';
	import { events as sabineEvents } from '@lantharos/sabine';
	import { GlassShell } from '@luft/ui';
	import * as api from '$lib/api';
	import DetailsPane from '$lib/components/details/DetailsPane.svelte';
	import DialogHost from '$lib/components/dialogs/DialogHost.svelte';
	import FilePane from '$lib/components/pane/FilePane.svelte';
	import QuickLook from '$lib/components/preview/QuickLook.svelte';
	import ChooserBar from '$lib/components/shell/ChooserBar.svelte';
	import FileContextMenu from '$lib/components/shell/FileContextMenu.svelte';
	import OperationDock from '$lib/components/shell/OperationDock.svelte';
	import StatusBar from '$lib/components/shell/StatusBar.svelte';
	import PlaceMenu from '$lib/components/sidebar/PlaceMenu.svelte';
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import TabStrip from '$lib/components/toolbar/TabStrip.svelte';
	import Toolbar from '$lib/components/toolbar/Toolbar.svelte';
	import VcsPanel from '$lib/components/vcs/VcsPanel.svelte';
	import VcsSaveDialog from '$lib/components/vcs/VcsSaveDialog.svelte';
	import { ChooserState } from '$lib/file-manager/chooser.svelte';
	import { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { handleKeydown } from '$lib/file-manager/keyboard';
	import { FileManager } from '$lib/file-manager/manager.svelte';
	import { openActivation, openLaunchPaths } from '$lib/file-manager/open-targets';
	import { TrashCounter } from '$lib/file-manager/places/places.svelte';
	import { setEntryContext } from '$lib/file-manager/view/entry-props';
	import { ViewState } from '$lib/file-manager/view/view-state.svelte';
	import { isDesktopRuntime } from '$lib/runtime';
	import { VcsState } from '$lib/vcs/state.svelte';

	const manager = new FileManager();
	const drag = new DragController(manager);
	const vcs = new VcsState();
	const trash = new TrashCounter();
	let chooser = $state<ChooserState | null>(null);
	const view = new ViewState(manager, () => chooser);
	setEntryContext({
		manager,
		drag,
		view,
		vcs,
		get chooser() {
			return chooser;
		}
	});
	let sidebar = $state<{ focusSearch: () => void }>();

	onMount(() => {
		if (!isDesktopRuntime()) return manager.startPreview();
		const unsubscribe = [
			api.events.operations((operations) => {
				manager.receiveOperations(operations);
				trash.receiveOperations(operations);
			}),
			api.events.drives(manager.reloadDrives),
			api.events.vcsStatus(vcs.receive),
			api.events.directory(({ path }) => {
				void manager.refreshListing(path);
				vcs.refresh();
			}),
			api.events.activation((activation) => void openActivation(manager, activation)),
			sabineEvents.fileDrag((event) => {
				if (!chooser) drag.native(event);
			})
		];
		void start();
		return () => unsubscribe.forEach((stop) => stop());
	});

	$effect(() => {
		if (manager.view !== 'home' || chooser) return vcs.clear();
		if (manager.currentPath && !manager.loading.active) void vcs.open(manager.currentPath);
	});

	$effect(() => {
		if (manager.trash) void trash.refresh();
	});

	async function start() {
		const state = await api.appState();
		chooser = state.chooser && new ChooserState(state.chooser, manager);
		await manager.start(state, state.chooser?.current_folder ?? undefined);
		if (!state.chooser) await openLaunchPaths(manager, state.launchPaths);
		const operations = await api.listOperations();
		manager.receiveOperations(operations);
		trash.receiveOperations(operations);
	}

	function refreshOnFocus() {
		vcs.refresh();
		void trash.refresh();
	}

	function dismissContextMenu(event: Event) {
		if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
		manager.closeMenus();
	}
</script>

<svelte:window
	onkeydown={(event) => handleKeydown(event, { manager, chooser, view, focusSearch: () => sidebar?.focusSearch() })}
	onclick={dismissContextMenu}
	onpointerdown={dismissContextMenu}
	oncontextmenu={dismissContextMenu}
	onfocus={refreshOnFocus}
	onmouseup={manager.handleNavigationButton}
	onpointermove={drag.settle}
/>

<div class="h-[100dvh] w-screen min-w-[800px] overflow-hidden bg-transparent text-[var(--text)]">
	<GlassShell class="h-full select-none [--sidebar-width:260px]">
		<Sidebar bind:this={sidebar} {manager} {drag} {chooser} {trash} />

		<main class="glass-content relative isolate">
			<Toolbar {manager} {drag} {view} {vcs} chooser={Boolean(chooser)} />
			<TabStrip {manager} {drag} />

			<div class="flex min-h-0 flex-1 overflow-hidden">
				<FilePane />
				{#if view.detailsOpen}
					<DetailsPane />
				{/if}
				<VcsPanel {vcs} />
			</div>

			{#if chooser}
				<ChooserBar {chooser} selectedCount={manager.selection.size} />
			{:else}
				<StatusBar {manager} {vcs} />
			{/if}
		</main>

		<OperationDock operations={manager.operations} />
		<QuickLook />

		{#if manager.contextMenu && !chooser}
			{#key manager.contextMenu}
				<FileContextMenu menu={manager.contextMenu} {manager} {view} {vcs} />
			{/key}
		{/if}
		{#if manager.placeMenu && !chooser}
			{#key manager.placeMenu}
				<PlaceMenu menu={manager.placeMenu} {manager} {trash} />
			{/key}
		{/if}

		<VcsSaveDialog {vcs} />
		<DialogHost {manager} {trash} />
	</GlassShell>
</div>
