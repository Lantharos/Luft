<script lang="ts">
	import { onMount } from 'svelte';
	import { appWindow, events as sabineEvents } from '@lantharos/sabine';
	import { t } from '@luft/i18n';
	import { appearance, ConfirmDialog, droppedPaths, GlassShell } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import ConflictDialog from '#lib/shell/ConflictDialog.svelte';
	import Header from '#lib/shell/Header.svelte';
	import Home from '#lib/shell/Home.svelte';
	import { handleKeydown } from '#lib/shell/keyboard.js';
	import QueueView from '#lib/shell/QueueView.svelte';
	import Unsupported from '#lib/shell/Unsupported.svelte';
	import Workspace from '#lib/shell/Workspace.svelte';
	import { queue } from '#lib/state/queue.svelte.js';
	import { session } from '#lib/state/session.svelte.js';

	let dragging = $state(false);

	onMount(() => {
		const stops = [queue.listen(), sabineEvents.singleInstance((activation) => void activate(activation))];
		void start();
		return () => stops.forEach((stop) => stop());
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function start() {
		const state = await commands.appState();
		appearance.start(state);
		session.start(state);
	}

	async function activate(activation: { arguments: string[]; workingDirectory?: string | null }) {
		await session.open(await commands.resolveArguments(activation), true);
	}

	function ondragover(event: DragEvent) {
		if (!event.dataTransfer?.types.includes('Files')) return;
		event.preventDefault();
		dragging = true;
	}

	function ondrop(event: DragEvent) {
		dragging = false;
		if (!event.dataTransfer?.types.includes('Files')) return;
		event.preventDefault();
		const paths = droppedPaths(event.dataTransfer);
		if (paths.length) void session.open(paths);
	}
</script>

<svelte:window onkeydown={handleKeydown} {ondragover} {ondrop} ondragleave={(event) => (dragging = event.relatedTarget !== null)} />

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full select-none">
		<main class="glass-content flex min-w-0 flex-col">
			<Header />
			{#if session.view === 'queue'}
				<QueueView />
			{:else if session.files.length}
				<Workspace />
			{:else}
				<Home over={dragging} />
			{/if}
		</main>
	</GlassShell>
</div>

{#if session.pending}
	<ConflictDialog pending={session.pending} />
{/if}
{#if session.closing}
	<ConfirmDialog
		title={t('close-title')}
		description={t('close-body')}
		action={t('close-action')}
		danger
		run={async () => appWindow.close()}
		onclose={() => (session.closing = false)}
	/>
{/if}
{#if session.showUnsupported}
	<Unsupported />
{/if}
