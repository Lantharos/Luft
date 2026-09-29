<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { appWindow, isAvailable } from '@lantharos/sabine';
	import { GlassShell, appearance } from '@luft/ui';
	import * as api from '$lib/api';
	import CloseDialog from '$lib/components/dialogs/CloseDialog.svelte';
	import PasteDialog from '$lib/components/dialogs/PasteDialog.svelte';
	import Preferences from '$lib/components/dialogs/Preferences.svelte';
	import TerminalMenu from '$lib/components/dialogs/TerminalMenu.svelte';
	import LayoutView from '$lib/components/LayoutView.svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import { settings } from '$lib/state/settings.svelte';
	import { loadFonts } from '$lib/terminal/fonts';
	import { handleShortcut } from '$lib/workspace/shortcuts';
	import { Workspace } from '$lib/workspace/workspace.svelte';

	const workspace = new Workspace();
	let dialogOpen = $derived(Boolean(workspace.pasteReview || workspace.closeReview || workspace.preferencesOpen));

	onMount(() => {
		if (!isAvailable()) return;
		const stops = [
			api.events.activation(async (activation) => workspace.openTab(await api.resolveLaunch(activation))),
			api.events.notification(({ tab, token }) => {
				const target = workspace.tabs.find((candidate) => candidate.key === tab);
				if (target) workspace.select(target);
				appWindow.focus(token ?? undefined);
			})
		];
		void start(stops);
		return () => stops.forEach((stop) => stop());
	});

	async function start(stops: (() => void)[]) {
		const [state] = await Promise.all([api.appState(), loadFonts()]);
		settings.start(state);
		stops.push(appearance.start(state));
		workspace.openTab(state.launch);
	}

	$effect(() => {
		settings.options;
		untrack(() => workspace.configure());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = settings.scheme;
	});

	$effect(() => {
		const session = workspace.focused;
		if (session && !dialogOpen && workspace.searching !== session) session.focus();
	});

	function keydown(event: KeyboardEvent) {
		if (event.defaultPrevented || dialogOpen) return;
		if (event.target instanceof HTMLElement && event.target.closest('.xterm')) return;
		handleShortcut(event, workspace);
	}
</script>

<svelte:window
	onkeydown={keydown}
	onpointerdown={(event) => {
		if (event.target instanceof Element && !event.target.closest('[role="menu"]')) workspace.menu = null;
	}}
/>

<div class="h-[100dvh] w-screen overflow-hidden bg-transparent">
	<GlassShell class="h-full">
		<div class="tern" style:--terminal-background={settings.surface}>
			<TabBar {workspace} />
			<main class="tab-views">
				{#each workspace.tabs as tab (tab.key)}
					<div class="tab-view" class:is-hidden={tab !== workspace.active}>
						<LayoutView node={tab.root} {workspace} visible={tab === workspace.active} />
					</div>
				{/each}
			</main>
		</div>

		{#if workspace.menu}
			<TerminalMenu menu={workspace.menu} {workspace} />
		{/if}
		{#if workspace.pasteReview}
			<PasteDialog review={workspace.pasteReview} onclose={() => (workspace.pasteReview = null)} />
		{/if}
		{#if workspace.closeReview}
			<CloseDialog review={workspace.closeReview} onclose={() => (workspace.closeReview = null)} />
		{/if}
		{#if workspace.preferencesOpen}
			<Preferences onclose={() => (workspace.preferencesOpen = false)} />
		{/if}
	</GlassShell>
</div>
