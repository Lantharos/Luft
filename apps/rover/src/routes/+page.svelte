<script lang="ts">
	import { onMount } from 'svelte';
	import { events as sabineEvents } from '@lantharos/sabine';
	import { GlassShell } from '@luft/ui';
	import * as api from '$lib/api';
	import FilePane from '$lib/components/pane/FilePane.svelte';
	import AppHeader from '$lib/components/shell/AppHeader.svelte';
	import ChooserBar from '$lib/components/shell/ChooserBar.svelte';
	import FileContextMenu from '$lib/components/shell/FileContextMenu.svelte';
	import OperationDock from '$lib/components/shell/OperationDock.svelte';
	import PathToolbar from '$lib/components/shell/PathToolbar.svelte';
	import Sidebar from '$lib/components/shell/Sidebar.svelte';
	import StatusBar from '$lib/components/shell/StatusBar.svelte';
	import VcsPanel from '$lib/components/vcs/VcsPanel.svelte';
	import VcsSaveDialog from '$lib/components/vcs/VcsSaveDialog.svelte';
	import { ChooserState } from '$lib/file-manager/chooser.svelte';
	import { DragController } from '$lib/file-manager/drag/controller.svelte';
	import { handleKeydown } from '$lib/file-manager/keyboard';
	import { FileManager } from '$lib/file-manager/manager.svelte';
	import { openActivation, openLaunchPaths } from '$lib/file-manager/open-targets';
	import { isDesktopRuntime } from '$lib/runtime';
	import { VcsState } from '$lib/vcs/state.svelte';

	const manager = new FileManager();
	const drag = new DragController(manager);
	const vcs = new VcsState();
	let chooser = $state<ChooserState | null>(null);
	let sidebar = $state<{ focusSearch: () => void }>();

	onMount(() => {
		if (!isDesktopRuntime()) return manager.startPreview();
		const unsubscribe = [
			api.events.operations(manager.receiveOperations),
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

	async function start() {
		const state = await api.appState();
		chooser = state.chooser && new ChooserState(state.chooser, manager);
		await manager.start(state, state.chooser?.current_folder ?? undefined);
		if (!state.chooser) await openLaunchPaths(manager, state.launchPaths);
		manager.receiveOperations(await api.listOperations());
	}

	function dismissContextMenu(event: Event) {
		if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
		manager.contextMenu = null;
	}
</script>

<svelte:window
	onkeydown={(event) => handleKeydown(event, { manager, chooser, focusSearch: () => sidebar?.focusSearch() })}
	onclick={dismissContextMenu}
	onpointerdown={dismissContextMenu}
	oncontextmenu={dismissContextMenu}
	onfocus={vcs.refresh}
	onmouseup={manager.handleNavigationButton}
/>

<div class="h-[100dvh] w-screen min-w-[800px] overflow-hidden bg-transparent text-[var(--text)]">
	<GlassShell class="h-full select-none [--sidebar-width:260px]">
		<Sidebar bind:this={sidebar} {manager} {drag} {chooser} />

		<main class="glass-content relative isolate">
			<AppHeader {manager} {drag} />

			{#if manager.view === 'home'}
				<PathToolbar {manager} {drag} {vcs} chooserMode={Boolean(chooser)} />
			{/if}

			<div class="flex min-h-0 flex-1 overflow-hidden">
				<FilePane {manager} {drag} {vcs} {chooser} />
				<VcsPanel {vcs} />
			</div>

			{#if chooser}
				<ChooserBar {chooser} selectedCount={manager.selection.size} />
			{:else}
				<StatusBar {manager} {vcs} />
			{/if}
		</main>
	</GlassShell>
</div>

<OperationDock operations={manager.operations} />

{#if manager.contextMenu && !chooser}
	{#key manager.contextMenu}
		<FileContextMenu menu={manager.contextMenu} {manager} {vcs} />
	{/key}
{/if}

<VcsSaveDialog {vcs} />
