<script lang="ts">
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { t } from '@luft/i18n';
	import { IconButton } from '@luft/ui';
	import { session } from '#lib/app/session.svelte.js';
	import { appState } from '#lib/app/state.js';
	import { pageNear } from '#lib/canvas/layout.js';
	import NotebookCanvas from '#lib/canvas/NotebookCanvas.svelte';
	import { Viewport } from '#lib/canvas/viewport.svelte.js';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PageRail from '#lib/rail/PageRail.svelte';
	import Toolbar, { type ToolbarActions } from '#lib/tools/Toolbar.svelte';
	import Header from './Header.svelte';
	import { handleKeys } from './keyboard';
	import NotebookMenu from './NotebookMenu.svelte';

	let { notebook }: { notebook: OpenNotebook } = $props();

	interface Place {
		zoom: number;
		x: number;
		y: number;
	}

	const viewport = new Viewport();
	let placed = false;
	let saveTimer = 0;
	let railOpen = $state(appState.get<boolean>('rail') ?? true);

	let current = $derived(viewport.layout.pages.length ? pageNear(viewport.layout, (viewport.y + viewport.height / 3) / viewport.zoom) : 0);

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
		const target = session.goTo;
		if (!placed || !target || target.notebook !== notebook.meta.id) return;
		const index = notebook.indexOf(target.page);
		if (index >= 0 && viewport.layout.pages[index]) {
			viewport.scrollToPage(viewport.layout.pages[index]);
			session.goTo = null;
		}
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

	function toggleRail() {
		railOpen = !railOpen;
		void appState.save({ rail: railOpen });
	}

	const jump = (index: number) => viewport.scrollToPage(viewport.layout.pages[index]);

	const actions: ToolbarActions = {
		undo: () => notebook.undo(),
		redo: () => notebook.redo(),
		addPage() {
			const page = notebook.addPage(current + 1);
			session.goTo = { notebook: notebook.meta.id, page: page.id };
		},
		fitWidth: () => viewport.fitWidth(viewport.layout.pages[current]),
		fitPage: () => viewport.fitPage(viewport.layout.pages[current]),
		actualSize: () => viewport.zoomAt(1, viewport.width / 2, viewport.height / 2),
		zoomBy: (factor) => viewport.zoomAt(viewport.zoom * factor, viewport.width / 2, viewport.height / 2)
	};
</script>

<svelte:window onkeydown={(event) => handleKeys(event, actions, viewport)} />

{#if railOpen}
	<PageRail {notebook} {current} onjump={jump} />
{/if}
<main class="glass-content relative">
	<Header />
	<div class="flex h-[48px] flex-none items-center gap-2 px-3">
		<div class="flex flex-1 items-center gap-1">
			<IconButton icon={PanelLeft} label={railOpen ? t('rail-hide') : t('rail-show')} onclick={toggleRail} />
			<NotebookMenu {notebook} />
		</div>
		<Toolbar {actions} zoom={viewport.zoom} />
		<div class="flex flex-1 justify-end">
			<span class="text-[12px] text-(--text-muted) tabular-nums">{t('page-of', { page: current + 1, pages: notebook.meta.pages.length })}</span>
		</div>
	</div>
	<NotebookCanvas {notebook} {viewport} />
</main>
