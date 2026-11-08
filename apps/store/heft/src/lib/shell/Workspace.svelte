<script lang="ts">
	import { appWindow } from '@lantharos/sabine';
	import { WindowControls } from '@luft/ui';
	import { appState } from '#lib/app/state.js';
	import { pageNear } from '#lib/canvas/layout.js';
	import NotebookCanvas from '#lib/canvas/NotebookCanvas.svelte';
	import { Viewport } from '#lib/canvas/viewport.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import Toolbar, { type ToolbarActions } from '#lib/tools/Toolbar.svelte';
	import { handleKeys } from './keyboard';

	let { notebook }: { notebook: OpenNotebook } = $props();

	interface Place {
		zoom: number;
		x: number;
		y: number;
	}

	const viewport = new Viewport();
	let placed = false;
	let saveTimer = 0;

	const currentPage = () => pageNear(viewport.layout, (viewport.y + viewport.height / 3) / viewport.zoom);

	$effect(() => {
		if (placed || !viewport.width || !viewport.layout.pages.length) return;
		placed = true;
		const place = appState.get<Record<string, Place>>('places')?.[notebook.meta.id];
		if (place) {
			viewport.zoom = place.zoom;
			viewport.x = place.x;
			viewport.y = place.y;
			viewport.clamp();
		} else viewport.fitWidth(viewport.layout.pages[0]);
	});

	$effect(() => {
		const place: Place = { zoom: viewport.zoom, x: viewport.x, y: viewport.y };
		if (!placed) return;
		clearTimeout(saveTimer);
		saveTimer = window.setTimeout(() => {
			const places = appState.get<Record<string, Place>>('places') ?? {};
			void appState.save({ places: { ...places, [notebook.meta.id]: place } });
		}, 600);
	});

	const actions: ToolbarActions = {
		undo: () => notebook.undo(),
		redo: () => notebook.redo(),
		addPage() {
			const index = currentPage() + 1;
			notebook.addPage(index);
			requestAnimationFrame(() => viewport.scrollToPage(viewport.layout.pages[index]));
		},
		fitWidth: () => viewport.fitWidth(viewport.layout.pages[currentPage()]),
		fitPage: () => viewport.fitPage(viewport.layout.pages[currentPage()]),
		actualSize: () => viewport.zoomAt(1, viewport.width / 2, viewport.height / 2),
		zoomBy: (factor) => viewport.zoomAt(viewport.zoom * factor, viewport.width / 2, viewport.height / 2)
	};
</script>

<svelte:window onkeydown={(event) => handleKeys(event, actions, viewport)} />

<main class="glass-content relative">
	<header class="drag-region flex h-[52px] flex-none items-center gap-3 pr-4 pl-5">
		<h1 class="min-w-0 flex-1 truncate text-[14px] font-semibold">{notebook.meta.name}</h1>
		<Toolbar {actions} zoom={viewport.zoom} />
		<div class="flex flex-1 justify-end">
			<WindowControls onclose={() => void notebook.close().finally(() => appWindow.close())} />
		</div>
	</header>
	<NotebookCanvas {notebook} {viewport} />
</main>
