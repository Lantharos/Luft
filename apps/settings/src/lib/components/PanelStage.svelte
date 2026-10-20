<script lang="ts">
	import { t } from '@luft/i18n';
	import { page, WindowControls } from '@luft/ui';
	import { isShown, titleOf } from '#lib/panels/registry.js';
	import { app } from '#lib/state/app.svelte.js';
	import { hardware } from '#lib/state/hardware.svelte.js';

	let view = $derived(app.view);
	let present = $derived(hardware.present);
	let scroller = $state<HTMLDivElement>();

	function leaveInPlace(node: Element, params: undefined, options: { direction: 'in' | 'out' | 'both' }) {
		if (scroller && node instanceof HTMLElement) {
			node.style.translate = `0 ${-scroller.scrollTop}px`;
			scroller.scrollTop = 0;
		}
		return page(node, params, options);
	}
</script>

<header class="drag-region flex h-[60px] flex-none items-center justify-between gap-4 pr-4 pl-8">
	<h1 class="truncate text-[20px] font-semibold">{view && present ? titleOf(view.panel, present) : ''}</h1>
	<WindowControls />
</header>
<div bind:this={scroller} class="soft-scroll min-h-0 flex-1 overflow-y-auto">
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
	.page {
		grid-area: 1 / 1;
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 28px;
	}
</style>
