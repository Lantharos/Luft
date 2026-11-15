<script lang="ts">
	import { t } from '@luft/i18n';
	import { MenuItem, tooltip } from '@luft/ui';
	import Minus from '@lucide/svelte/icons/minus';
	import MoveHorizontal from '@lucide/svelte/icons/move-horizontal';
	import Plus from '@lucide/svelte/icons/plus';
	import RectangleVertical from '@lucide/svelte/icons/rectangle-vertical';
	import Search from '@lucide/svelte/icons/search';
	import { canPrint, printCurrent } from '#lib/app/actions.js';
	import MoreMenu from '#lib/shell/MoreMenu.svelte';
	import FindBar from './FindBar.svelte';
	import { documentState } from './state.svelte';
</script>

{#if documentState.finding}
	<FindBar />
{:else}
	<button type="button" class="icon-button" aria-label={t('magpie-document-find-label')} disabled={!documentState.viewer} onclick={() => (documentState.finding = true)} {@attach tooltip(t('magpie-document-find'))}>
		<Search size={17} />
	</button>
{/if}
<div class="mx-1 flex items-center">
	<button type="button" class="icon-button" aria-label={t('magpie-zoom-out')} disabled={!documentState.viewer} onclick={() => documentState.zoom(-1)} {@attach tooltip(t('magpie-zoom-out'))}>
		<Minus size={16} />
	</button>
	<span class="min-w-[48px] text-center text-[12px] font-semibold text-[var(--text-soft)] tabular-nums">{t('magpie-zoom-percent', { percent: Math.round(documentState.scale * 100) })}</span>
	<button type="button" class="icon-button" aria-label={t('magpie-zoom-in')} disabled={!documentState.viewer} onclick={() => documentState.zoom(1)} {@attach tooltip(t('magpie-zoom-in'))}>
		<Plus size={16} />
	</button>
</div>
<button
	type="button"
	class="icon-button"
	class:on={documentState.fit === 'page-width'}
	aria-label={t('magpie-document-fit-width')}
	aria-pressed={documentState.fit === 'page-width'}
	disabled={!documentState.viewer}
	onclick={() => documentState.setFit('page-width')}
	{@attach tooltip(t('magpie-document-fit-width'))}
>
	<MoveHorizontal size={17} />
</button>
<button
	type="button"
	class="icon-button"
	class:on={documentState.fit === 'page-fit'}
	aria-label={t('magpie-document-fit-page')}
	aria-pressed={documentState.fit === 'page-fit'}
	disabled={!documentState.viewer}
	onclick={() => documentState.setFit('page-fit')}
	{@attach tooltip(t('magpie-document-fit-page'))}
>
	<RectangleVertical size={17} />
</button>
<MoreMenu>
	{#snippet children(close)}
		<MenuItem
			disabled={!canPrint()}
			onclick={() => {
				close();
				void printCurrent();
			}}>{t('magpie-print')}</MenuItem
		>
	{/snippet}
</MoreMenu>

<style>
	.on {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
