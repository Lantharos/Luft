<script lang="ts">
	import { tooltip, WindowControls } from '@luft/ui';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import { parent } from '#lib/library/kinds.js';
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
			aria-label={chrome.sidebar ? 'Hide sidebar' : 'Show sidebar'}
			aria-pressed={chrome.sidebar}
			onclick={() => chrome.toggleSidebar()}
			{@attach tooltip(chrome.sidebar ? 'Hide sidebar' : 'Show sidebar')}
		>
			<PanelLeft size={18} />
		</button>
		{#if library.current}
			<button type="button" class="icon-button" aria-label="Back to folder" onclick={() => library.close()} {@attach tooltip('Back to folder')}>
				<ChevronLeft size={19} />
			</button>
		{:else if library.folder && library.folder !== '/'}
			<button type="button" class="icon-button" aria-label="Enclosing folder" onclick={() => library.browse(parent(library.folder!))} {@attach tooltip('Enclosing folder')}>
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
