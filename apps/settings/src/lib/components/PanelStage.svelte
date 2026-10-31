<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { t } from '@luft/i18n';
	import { IconButton, page, WindowControls } from '@luft/ui';
	import { isShown, titleOf } from '#lib/panels/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';

	const MOUSE_BACK = 3;
	const MOUSE_FORWARD = 4;

	let view = $derived(app.view);
	let present = $derived(hardware.present);
	let title = $derived(app.page?.title ?? (view && present ? titleOf(view.panel, present) : ''));

	function navigateWithKeys(event: KeyboardEvent) {
		if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
		event.preventDefault();
		if (event.key === 'ArrowLeft') app.back();
		else app.forward();
	}

	function navigateWithMouse(event: MouseEvent) {
		if (event.button === MOUSE_BACK) app.back();
		else if (event.button === MOUSE_FORWARD) app.forward();
	}
	let scroller = $state<HTMLDivElement>();

	function leaveInPlace(node: Element, params: undefined, options: { direction: 'in' | 'out' | 'both' }) {
		if (scroller && node instanceof HTMLElement) {
			node.style.translate = `0 ${-scroller.scrollTop}px`;
			scroller.scrollTop = 0;
		}
		return page(node, params, options);
	}
</script>

<svelte:window onkeydown={navigateWithKeys} onmouseup={navigateWithMouse} />

<header class="drag-region flex h-[60px] flex-none items-center gap-2 pr-4 pl-4">
	<div class="flex items-center">
		<IconButton icon={ChevronLeft} label={t('settings-navigate-back')} large disabled={!app.canGoBack} onclick={() => app.back()} />
		<IconButton icon={ChevronRight} label={t('settings-navigate-forward')} large disabled={!app.canGoForward} onclick={() => app.forward()} />
	</div>
	<h1 class="min-w-0 flex-1 truncate text-[20px] font-semibold">{title}</h1>
	{#if app.page?.actions}
		<div class="flex items-center gap-2">{@render app.page.actions()}</div>
	{/if}
	<WindowControls />
</header>
<div bind:this={scroller} class="soft-scroll stable-scroll min-h-0 flex-1 overflow-y-auto">
	<div class="mx-auto grid w-full max-w-[760px] px-8 pt-2 pb-10">
		{#if view && present}
			{#key view.panel}
				<div class="page" in:page out:leaveInPlace>
					{#if isShown(view.panel, present)}
						<view.component />
					{:else if view.panel.needs}
						<p class="px-1.5 text-[14px] text-[var(--text-muted)]">{t(view.panel.needs.missing)}</p>
					{/if}
				</div>
			{/key}
		{/if}
	</div>
</div>

<style>
	.stable-scroll {
		scrollbar-gutter: stable;
	}

	.page {
		grid-area: 1 / 1;
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 28px;
	}
</style>
