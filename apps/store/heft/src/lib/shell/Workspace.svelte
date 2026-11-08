<script lang="ts">
	import { untrack } from 'svelte';
	import { appWindow } from '@lantharos/sabine';
	import Maximize from '@lucide/svelte/icons/maximize-2';
	import Minimize from '@lucide/svelte/icons/minimize-2';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { t } from '@luft/i18n';
	import { IconButton } from '@luft/ui';
	import { appState } from '#lib/app/state.js';
	import { addPicture } from '#lib/objects/editing.svelte.js';
	import { requests } from '#lib/app/requests.svelte.js';
	import ExportDialog from '#lib/export/ExportDialog.svelte';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PageRail from '#lib/rail/PageRail.svelte';
	import Toolbar from '#lib/tools/Toolbar.svelte';
	import Header from './Header.svelte';
	import { handleKeys } from './keyboard';
	import NotebookMenu from './NotebookMenu.svelte';
	import { Pane } from './pane.svelte';
	import PaneView from './PaneView.svelte';

	let { notebook, beside }: { notebook: OpenNotebook; beside: OpenNotebook | null } = $props();

	const main = new Pane(untrack(() => notebook));
	let second: Pane | null = $state(null);

	$effect(() => {
		const other = beside;
		second = untrack(() => (other && second?.notebook === other ? second : other ? new Pane(other) : null));
	});
	let focused = $state<'main' | 'second'>('main');
	let pane = $derived(focused === 'second' && second ? second : main);
	let railOpen = $state(appState.get<boolean>('rail') ?? true);
	let focusing = $state(false);

	function focusMode(on: boolean) {
		focusing = on;
		appWindow.setFullscreen(on);
	}
	let width = $state(0);
	let height = $state(0);
	let current = $derived(pane.current);
	let books = $derived(pane.notebook.meta.pages.some((page) => page.pdf));

	function quoteFrom(from: Pane) {
		return second ? (text: string) => (from === main ? second! : main).quote(text) : undefined;
	}

	async function paste(event: ClipboardEvent) {
		if ((event.target as HTMLElement | null)?.isContentEditable) return;
		const image = [...(event.clipboardData?.files ?? [])].find((file) => file.type.startsWith('image/'));
		const page = pane.page;
		if (!page) return;
		event.preventDefault();
		if (image) await addPicture(page.document, pane.notebook.folder, page.rect, new Uint8Array(await image.arrayBuffer()), image.name);
		else pane.actions.paste();
	}

	function toggleRail() {
		railOpen = !railOpen;
		void appState.save({ rail: railOpen });
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'F11' || (focusing && event.key === 'Escape')) {
			event.preventDefault();
			focusMode(!focusing);
		} else handleKeys(event, pane.actions, pane.viewport);
	}}
	onpaste={(event) => void paste(event)}
/>

{#if railOpen && !focusing}
	<PageRail notebook={pane.notebook} {current} onjump={(index) => pane.jump(index)} />
{/if}
<main class="glass-content relative">
	{#if !focusing}
		<Header />
	{/if}
	<div class="flex h-[48px] flex-none items-center gap-2 px-3">
		<div class="flex min-w-0 flex-1 items-center gap-1">
			<IconButton icon={PanelLeft} label={railOpen ? t('rail-hide') : t('rail-show')} onclick={toggleRail} />
			<NotebookMenu notebook={pane.notebook} />
		</div>
		<Toolbar actions={pane.actions} zoom={pane.viewport.zoom} {books} />
		<div class="flex flex-1 items-center justify-end gap-2">
			<span class="text-[12px] text-(--text-muted) tabular-nums">{t('page-of', { page: current + 1, pages: pane.notebook.meta.pages.length })}</span>
			<IconButton icon={focusing ? Minimize : Maximize} label={focusing ? t('focus-leave') : t('focus-enter')} onclick={() => focusMode(!focusing)} />
		</div>
	</div>
	<div class="flex min-h-0 flex-1 gap-px" class:flex-col={width < height * 1.15} bind:clientWidth={width} bind:clientHeight={height}>
		<PaneView pane={main} active={second !== null && focused === 'main'} onfocus={() => (focused = 'main')} onquote={quoteFrom(main)} />
		{#if second}
			{#key second}
				<PaneView pane={second} active={focused === 'second'} onfocus={() => (focused = 'second')} onquote={quoteFrom(second)} />
			{/key}
		{/if}
	</div>
</main>

{#if requests.export}
	<ExportDialog notebook={pane.notebook} current={pane.current} format={requests.export} onclose={() => (requests.export = null)} />
{/if}
