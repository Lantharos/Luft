<script lang="ts">
	import type { Snippet } from 'svelte';
	import WindowControls from './WindowControls.svelte';

	interface Props {
		title?: string;
		detail?: string | null;
		compact?: boolean;
		maximizable?: boolean;
		closable?: boolean;
		onclose?: () => void;
		leading?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	}

	let { title = '', detail, compact = false, maximizable, closable, onclose, leading, actions, children }: Props = $props();
</script>

<header class={['title-bar drag-region', leading && 'leading']}>
	{#if leading}
		<div class="flex flex-none items-center">{@render leading()}</div>
	{/if}
	{#if children}
		{@render children()}
	{:else if compact}
		<div class="min-w-0 flex-1">
			<h1 class="truncate text-[14px] font-semibold">{title}</h1>
			{#if detail}
				<p class="truncate text-[12px] text-[var(--text-muted)]">{detail}</p>
			{/if}
		</div>
	{:else}
		<div class="flex min-w-0 flex-1 items-baseline gap-3">
			<h1 class="truncate text-[20px] font-semibold">{title}</h1>
			{#if detail}
				<span class="truncate text-[13px] text-[var(--text-muted)]">{detail}</span>
			{/if}
		</div>
	{/if}
	{#if actions}
		<div class="title-bar-actions">{@render actions()}</div>
	{/if}
	<WindowControls {maximizable} {closable} {onclose} />
</header>
