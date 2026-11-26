<script lang="ts">
	import { onMount } from 'svelte';
	import { events as sabineEvents } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { appearance, EmptyState, GlassShell, Spinner, Toast, WindowControls } from '@luft/ui';
	import { events } from '#lib/bindings.js';
	import { App } from '#lib/app/app.svelte.js';
	import { provideApp } from '#lib/app/context.js';
	import Dialogs from '#lib/app/Dialogs.svelte';
	import Editor from '#lib/editor/Editor.svelte';
	import Home from '#lib/home/Home.svelte';
	import { previews } from '#lib/home/previews.svelte.js';
	import Whiteboard from '#lib/whiteboard/Whiteboard.svelte';
	import QuickEdit from '#lib/quick/QuickEdit.svelte';

	const app = new App();
	provideApp(app);

	onMount(() => {
		const stops = [events.easelThumbnails(previews.receive), sabineEvents.openUrlsAvailable(() => void app.openPending())];
		void app.start().then(() => app.openPending());
		return () => stops.forEach((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	function globalKeys(event: KeyboardEvent) {
		if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'n' || app.dialog) return;
		event.preventDefault();
		if (event.shiftKey) void app.newBoard();
		else app.dialog = 'new-image';
	}
</script>

<svelte:window onkeydown={globalKeys} />

<div class="h-dvh w-screen overflow-hidden text-(--text)">
	{#if app.failure}
		<GlassShell class="h-full">
			<main class="glass-content">
				<header class="drag-region flex h-14 flex-none items-center justify-end pr-3"><WindowControls /></header>
				<EmptyState title={t('easel-no-gpu')} message={app.failure} tone="danger" />
			</main>
		</GlassShell>
	{:else if !app.ready}
		<GlassShell class="h-full"><main class="glass-content drag-region"></main></GlassShell>
	{:else if app.screen.kind === 'editor'}
		{#key app.screen.editor}
			<Editor editor={app.screen.editor} name={app.screen.name} />
		{/key}
	{:else if app.screen.kind === 'quick'}
		{#key app.screen.quick}
			<QuickEdit quick={app.screen.quick} name={app.screen.name} />
		{/key}
	{:else if app.screen.kind === 'board'}
		{#key app.screen.whiteboard}
			<Whiteboard whiteboard={app.screen.whiteboard} name={app.screen.name} />
		{/key}
	{:else}
		<Home />
	{/if}
	{#if app.busy}
		<div class="pointer-events-none fixed right-5 bottom-5"><Spinner /></div>
	{/if}
	<Dialogs />
	<Toast toast={app.toasts.current} ondismiss={app.toasts.dismiss} onhold={app.toasts.hold} onrelease={app.toasts.release} />
</div>
