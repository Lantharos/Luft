<script lang="ts">
	import ChevronLeft from '@luft/symbols/icons/chevron-left';
	import ChevronRight from '@luft/symbols/icons/chevron-right';
	import { t } from '@luft/i18n';
	import { IconButton, PageStage, TitleBar } from '@luft/ui';
	import { isShown, PANELS, titleOf } from '#lib/panels/registry.js';
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
</script>

<svelte:window onkeydown={navigateWithKeys} onmouseup={navigateWithMouse} />

<TitleBar {title} actions={app.page?.actions}>
	{#snippet leading()}
		<IconButton icon={ChevronLeft} label={t('settings-navigate-back')} large disabled={!app.canGoBack} onclick={() => app.back()} />
		<IconButton icon={ChevronRight} label={t('settings-navigate-forward')} large disabled={!app.canGoForward} onclick={() => app.forward()} />
	{/snippet}
</TitleBar>
{#if view && present}
	<PageStage page={view.panel} order={PANELS.indexOf(view.panel)} class="mx-auto w-full max-w-[760px] gap-7 px-8 pt-2 pb-10">
		{#if isShown(view.panel, present)}
			<view.component />
		{:else if view.panel.needs}
			<p class="px-1.5 text-[14px] text-[var(--text-muted)]">{t(view.panel.needs.missing)}</p>
		{/if}
	</PageStage>
{/if}
