<script lang="ts">
	import { t } from '@luft/i18n';
	import { parent, tooltip, WindowControls } from '@luft/ui';
	import ArrowUp from '@luft/symbols/icons/arrow-up';
	import ChevronLeft from '@luft/symbols/icons/chevron-left';
	import PanelLeft from '@luft/symbols/icons/panel-left';
	import { library } from '#lib/library/library.svelte.js';
	import type { Snippet } from 'svelte';
	import { chrome } from '#lib/app/chrome.svelte.js';

	interface Props {
		title: string;
		subtitle?: string | null;
		overlay?: boolean;
		actions?: Snippet;
	}

	let { title, subtitle, overlay = false, actions }: Props = $props();
</script>

<header class="drag-region header" class:overlay class:fade-idle={overlay}>
	{#if chrome.mode === 'library'}
		<button
			type="button"
			class="icon-button"
			aria-label={chrome.sidebar ? t('magpie-header-hide-sidebar') : t('magpie-header-show-sidebar')}
			aria-pressed={chrome.sidebar}
			onclick={() => chrome.toggleSidebar()}
			{@attach tooltip(chrome.sidebar ? t('magpie-header-hide-sidebar') : t('magpie-header-show-sidebar'))}
		>
			<PanelLeft size={18} />
		</button>
		{#if library.current}
			<button type="button" class="icon-button" aria-label={t('magpie-header-back')} onclick={() => library.close()} {@attach tooltip(t('magpie-header-back'))}>
				<ChevronLeft size={19} />
			</button>
		{:else if library.folder && library.folder !== '/'}
			<button type="button" class="icon-button" aria-label={t('magpie-header-enclosing')} onclick={() => library.browse(parent(library.folder!))} {@attach tooltip(t('magpie-header-enclosing'))}>
				<ArrowUp size={18} />
			</button>
		{/if}
	{/if}
	<div class="min-w-0 flex-1 px-1">
		<h1 class="truncate text-[14px] font-semibold">{title}</h1>
		{#if subtitle}
			<p class="truncate text-[12px] text-[var(--text-muted)]">{subtitle}</p>
		{/if}
	</div>
	<div class="flex items-center gap-1" data-no-drag>
		{@render actions?.()}
	</div>
	{#if !chrome.fullscreen}
		<div class="ml-2"><WindowControls /></div>
	{/if}
</header>

<style>
	.header {
		position: relative;
		z-index: 20;
		display: flex;
		height: 60px;
		flex: none;
		align-items: center;
		gap: 6px;
		padding-inline: 16px;
	}

	.header.overlay {
		position: absolute;
		inset: 0 0 auto;
		background: color-mix(in oklab, #0b0b0a 72%, transparent);
		backdrop-filter: blur(18px);
	}
</style>
