<script lang="ts">
	import { untrack } from 'svelte';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { t } from '@luft/i18n';
	import { IconButton } from '@luft/ui';
	import { appState } from '#lib/app/state.js';
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
	let width = $state(0);
	let height = $state(0);
	let current = $derived(pane.current);
	let books = $derived(pane.notebook.meta.pages.some((page) => page.pdf));

	function toggleRail() {
		railOpen = !railOpen;
		void appState.save({ rail: railOpen });
	}
</script>

<svelte:window onkeydown={(event) => handleKeys(event, pane.actions, pane.viewport)} />

{#if railOpen}
	<PageRail notebook={pane.notebook} {current} onjump={(index) => pane.jump(index)} />
{/if}
<main class="glass-content relative">
	<Header />
	<div class="flex h-[48px] flex-none items-center gap-2 px-3">
		<div class="flex min-w-0 flex-1 items-center gap-1">
			<IconButton icon={PanelLeft} label={railOpen ? t('rail-hide') : t('rail-show')} onclick={toggleRail} />
			<NotebookMenu notebook={pane.notebook} />
		</div>
		<Toolbar actions={pane.actions} zoom={pane.viewport.zoom} {books} />
		<div class="flex flex-1 justify-end">
			<span class="text-[12px] text-(--text-muted) tabular-nums">{t('page-of', { page: current + 1, pages: pane.notebook.meta.pages.length })}</span>
		</div>
	</div>
	<div class="flex min-h-0 flex-1 gap-px" class:flex-col={width < height * 1.15} bind:clientWidth={width} bind:clientHeight={height}>
		<PaneView pane={main} active={second !== null && focused === 'main'} onfocus={() => (focused = 'main')} />
		{#if second}
			{#key second}
				<PaneView pane={second} active={focused === 'second'} onfocus={() => (focused = 'second')} />
			{/key}
		{/if}
	</div>
</main>
