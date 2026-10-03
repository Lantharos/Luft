<script lang="ts">
	import { WindowControls } from '@luft/ui';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string | null;
		width?: number | null;
		leading?: Snippet;
		actions?: Snippet;
	}

	let { title, subtitle, width = null, leading, actions }: Props = $props();
</script>

<header class="drag-region header">
	<div class="flex min-w-0 flex-none items-center gap-1" style:width={width ? `${width}px` : undefined} class:flex-1={!width}>
		{@render leading?.()}
		<div class="min-w-0 px-2">
			<h1 class="truncate text-[15px] font-semibold">{title}</h1>
			{#if subtitle}
				<p class="truncate text-[12px] text-[var(--text-muted)]">{subtitle}</p>
			{/if}
		</div>
	</div>
	<div class="flex min-w-0 flex-1 items-center justify-end gap-1 pr-2">
		{@render actions?.()}
	</div>
	<WindowControls />
</header>

<style>
	.header {
		position: relative;
		z-index: 20;
		display: flex;
		height: 60px;
		flex: none;
		align-items: center;
		padding-inline: 8px 16px;
	}
</style>
