<script lang="ts">
	import { onMount } from 'svelte';
	import { events as sabineEvents, type SingleInstanceEvent } from '@lantharos/sabine';
	import { i18n, t } from '@luft/i18n';
	import { appearance, CommandPalette, errorText, GlassShell } from '@luft/ui';
	import { commands } from '#lib/bindings.js';
	import { recent } from '#lib/app/recent.svelte.js';
	import { session } from '#lib/app/session.svelte.js';
	import { settings } from '#lib/app/settings.svelte.js';
	import { appState } from '#lib/app/state.js';
	import DragGhost from '#lib/drag/DragGhost.svelte';
	import '#lib/drag/drops.js';
	import Home from '#lib/home/Home.svelte';
	import ImportDialog from '#lib/home/ImportDialog.svelte';
	import { isPdf } from '#lib/pdf/import.js';
	import CarryGhost from '#lib/drag/CarryGhost.svelte';
	import { reader } from '#lib/handwriting/reader.svelte.js';
	import { power } from '#lib/recording/power.svelte.js';
	import { processing } from '#lib/recording/processing.svelte.js';
	import { recorder } from '#lib/recording/recorder.svelte.js';
	import { pen } from '#lib/input/pen.svelte.js';
	import { library } from '#lib/library/library.svelte.js';
	import { handleAppKeys } from '#lib/shell/keyboard.js';
	import { requests } from '#lib/app/requests.svelte.js';
	import SubjectDialog from '#lib/home/SubjectDialog.svelte';
	import { searchIndex } from '#lib/search/index.svelte.js';
	import { everything, palette } from '#lib/search/palette.js';
	import Workspace from '#lib/shell/Workspace.svelte';
	import { tools } from '#lib/tools/tools.svelte.js';
	import { dock } from '#lib/tools/dock.svelte.js';

	let ready = $state(false);
	let importing: string[] = $state([]);
	let failure: string | null = $state(null);
	let stopReading = () => {};
	let stopRecording = () => {};

	onMount(() => {
		const stops = [pen.start(), sabineEvents.singleInstance((activation) => void activate(activation))];
		start().catch((error) => (failure = errorText(error)));
		return () => {
			stops.forEach((stop) => stop());
			stopReading();
			stopRecording();
		};
	});

	$effect(() => {
		document.documentElement.dataset.scheme = appearance.scheme;
	});

	async function start() {
		const state = await commands.appState();
		appearance.start(state);
		await Promise.all([i18n.ready, settings.load(), appState.load(), library.load()]);
		tools.load();
		await dock.load();
		recent.load();
		await session.start();
		ready = true;
		void searchIndex.load();
		stopReading = reader.start();
		const stops = [await power.start(), recorder.start(), processing.start()];
		stopRecording = () => stops.forEach((stop) => stop());
		importing = state.launchPaths.filter(isPdf);
	}

	function keys(event: KeyboardEvent) {
		if (ready && (event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			palette.show(everything({ newSubject: () => (requests.newSubject = true), exportPdf: () => (requests.export = 'pdf'), exportPng: () => (requests.export = 'png') }));
			return;
		}
		handleAppKeys(event);
	}

	async function activate(activation: SingleInstanceEvent) {
		importing = (await commands.resolveArguments(activation)).filter(isPdf);
	}
</script>

<svelte:window onkeydown={keys} />

<div class="h-[100dvh] w-screen overflow-hidden">
	<GlassShell class="h-full select-none">
		{#if failure}
			<main class="glass-content drag-region grid place-items-center p-8 text-center">
				<div class="max-w-[420px]">
					<h1 class="text-[17px] font-semibold">{t('start-failed-title')}</h1>
					<p class="mt-2 text-[13px] text-(--text-soft)">{t('start-failed-body', { error: failure })}</p>
				</div>
			</main>
		{:else if !ready}
			<main class="glass-content drag-region"></main>
		{:else if session.current}
			{#key session.current}
				<Workspace notebook={session.current} beside={session.beside} />
			{/key}
		{:else}
			<Home />
		{/if}
	</GlassShell>
</div>
<DragGhost />
<CarryGhost />
<CommandPalette {palette} />
{#if requests.newSubject}
	<SubjectDialog onclose={() => (requests.newSubject = false)} />
{/if}
{#if importing.length && ready}
	<ImportDialog paths={importing} onclose={() => (importing = [])} />
{/if}
