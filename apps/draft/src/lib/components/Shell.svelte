<script lang="ts">
	import { appearance, GlassShell } from '@luft/ui';
	import { untrack } from 'svelte';
	import type { App } from '#lib/app.svelte.js';
	import { runShortcut } from '#lib/commands/shortcuts.js';
	import { provideApp } from '#lib/context.js';
	import CloseDialog from './dialogs/CloseDialog.svelte';
	import Menu from './Menu.svelte';
	import EditorPane from './editor/EditorPane.svelte';
	import StatusBar from './editor/StatusBar.svelte';
	import TitleBar from './editor/TitleBar.svelte';
	import PaletteView from './palette/PaletteView.svelte';
	import MarkdownPreview from './preview/MarkdownPreview.svelte';
	import Sidebar from './sidebar/Sidebar.svelte';

	let { app }: { app: App } = $props();
	provideApp(untrack(() => app));

	let settings = $derived(app.settings.value);
	let previewing = $derived(settings.preview && app.markdown);
	let sidebar = $derived(app.configured && app.workspace.browsing && settings.sidebar);

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});
</script>

<svelte:window onkeydowncapture={(event) => runShortcut(app, event)} onfocus={() => void app.refreshFromDisk()} />

<div class="h-[100dvh] w-screen overflow-hidden bg-transparent text-[var(--text)]" style:--editor-font-size="{settings.fontSize}px">
	<GlassShell class="h-full [--sidebar-width:260px]">
		{#if sidebar}
			<Sidebar />
		{/if}
		<main class="glass-content relative isolate">
			<TitleBar />
			<div class="flex min-h-0 flex-1">
				<EditorPane />
				{#if previewing}
					<MarkdownPreview />
				{/if}
			</div>
			<StatusBar />
		</main>
		<PaletteView />
		<CloseDialog />
		<Menu />
	</GlassShell>
</div>
