<script lang="ts">
	import { untrack } from 'svelte';
	import { appWindow } from '@lantharos/sabine';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Maximize from '@lucide/svelte/icons/maximize-2';
	import Minimize from '@lucide/svelte/icons/minimize-2';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { t } from '@luft/i18n';
	import { IconButton } from '@luft/ui';
	import { settings } from '#lib/app/settings.svelte.js';
	import { appState } from '#lib/app/state.js';
	import { addPicture } from '#lib/objects/editing.svelte.js';
	import { requests } from '#lib/app/requests.svelte.js';
	import ExportDialog from '#lib/export/ExportDialog.svelte';
	import PaperDialog from '#lib/paper/PaperDialog.svelte';
	import CameraDialog from '#lib/objects/CameraDialog.svelte';
	import type { OpenNotebook } from '#lib/library/notebook.svelte.js';
	import PageRail from '#lib/rail/PageRail.svelte';
	import Toolbar from '#lib/tools/Toolbar.svelte';
	import Header from './Header.svelte';
	import { handleKeys } from './keyboard';
	import NotebookMenu from './NotebookMenu.svelte';
	import { Pane } from './pane.svelte';
	import PaneView from './PaneView.svelte';
	import { player } from '#lib/recording/player.svelte.js';
	import { processing } from '#lib/recording/processing.svelte.js';
	import { recorder } from '#lib/recording/recorder.svelte.js';
	import PlayerBar from '#lib/recording/view/PlayerBar.svelte';
	import RecordControls from '#lib/recording/view/RecordControls.svelte';
	import RecordingPanel from '#lib/recording/view/RecordingPanel.svelte';
	import StopDialog from '#lib/recording/view/StopDialog.svelte';

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
	let panelOpen = $state(appState.get<boolean>('recordingPanel') ?? false);
	let playing = $derived(player.openIn(pane.notebook));
	let focusing = $state(false);

	function focusMode(on: boolean) {
		focusing = on;
		appWindow.setFullscreen(on);
	}
	let width = $state(0);
	let height = $state(0);
	let current = $derived(pane.current);
	let books = $derived(pane.notebook.meta.pages.some((page) => page.pdf));
	let side = $derived(settings.toolbar === 'side');
	let single = $derived(pane.viewport.single !== null);

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

	function togglePanel() {
		panelOpen = !panelOpen;
		void appState.save({ recordingPanel: panelOpen });
	}

	const pageInView = () => pane.notebook.meta.pages[pane.current]?.id ?? pane.notebook.meta.pages[0].id;

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
			<NotebookMenu notebook={pane.notebook} {current} />
		</div>
		{#if !side}
			<Toolbar actions={pane.actions} zoom={pane.viewport.zoom} {books} ruled={pane.ruler.shown} />
		{/if}
		<div class="flex flex-1 items-center justify-end gap-2">
			<RecordControls notebook={pane.notebook} page={pageInView} />
			{#if single}
				<IconButton icon={ChevronUp} label={t('page-previous')} onclick={() => pane.viewport.turn(-1)} />
			{/if}
			<span class="text-[12px] whitespace-nowrap text-(--text-muted) tabular-nums">{t('page-of', { page: current + 1, pages: pane.notebook.meta.pages.length })}</span>
			{#if single}
				<IconButton icon={ChevronDown} label={t('page-next')} onclick={() => pane.viewport.turn(1)} />
			{/if}
			<IconButton icon={focusing ? Minimize : Maximize} label={focusing ? t('focus-leave') : t('focus-enter')} onclick={() => focusMode(!focusing)} />
		</div>
	</div>
	<div class="flex min-h-0 flex-1">
		{#if side}
			<div class="soft-scroll flex flex-none flex-col items-center overflow-y-auto px-2 pb-3">
				<Toolbar actions={pane.actions} zoom={pane.viewport.zoom} {books} ruled={pane.ruler.shown} side />
			</div>
		{/if}
		<div class="relative flex min-h-0 min-w-0 flex-1 gap-px" class:flex-col={width < height * 1.15} bind:clientWidth={width} bind:clientHeight={height}>
			<PaneView pane={main} active={second !== null && focused === 'main'} onfocus={() => (focused = 'main')} onquote={quoteFrom(main)} />
			{#if second}
				{#key second}
					<PaneView pane={second} active={focused === 'second'} onfocus={() => (focused = 'second')} onquote={quoteFrom(second)} />
				{/key}
			{/if}
			{#if playing}
				<PlayerBar panel={panelOpen} onpanel={togglePanel} />
			{/if}
		</div>
		{#if playing && panelOpen && !focusing}
			<RecordingPanel notebook={pane.notebook} after={() => pane.current} />
		{/if}
	</div>
</main>

{#if requests.photo}
	<CameraDialog onphoto={(bytes) => void pane.addPhoto(bytes)} onclose={() => (requests.photo = false)} />
{/if}
{#if requests.paper}
	<PaperDialog notebook={pane.notebook} page={pane.notebook.meta.pages[current]} onclose={() => (requests.paper = false)} />
{/if}
{#if recorder.stopped}
	<StopDialog
		notebook={recorder.stopped.notebook}
		recording={recorder.stopped.recording}
		onclose={() => {
			recorder.stopped = null;
			processing.kick();
		}}
	/>
{/if}
{#if requests.export}
	<ExportDialog notebook={pane.notebook} current={pane.current} format={requests.export} onclose={() => (requests.export = null)} />
{/if}
