<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		title: string;
		description?: string;
		leading: Snippet;
		onclick?: () => void;
		children?: Snippet;
	}

	let { title, description, leading, onclick, children }: Props = $props();
</script>

{#snippet content()}
	{@render leading()}
	<span class="text">
		<span class="title">{title}</span>
		{#if description}
			<span class="description">{description}</span>
		{/if}
	</span>
	{#if onclick}
		<ChevronRight size={18} class="shrink-0 text-[var(--text-muted)]" />
	{/if}
{/snippet}

<div class="row">
	{#if onclick}
		<button type="button" class="main interactive" {onclick}>{@render content()}</button>
	{:else}
		<div class="main">{@render content()}</div>
	{/if}
	{#if children}
		<div class="trailing">{@render children()}</div>
	{/if}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-right: 16px;
		transition: background-color 160ms var(--ease);
	}

	.row:has(.interactive:hover) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		min-width: 0;
		min-height: 56px;
		flex: 1;
		align-items: center;
		gap: 14px;
		padding: 10px 12px 10px 16px;
		text-align: left;
	}

	.text {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 2px;
	}

	.title {
		overflow: hidden;
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.description {
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--text-muted);
	}

	.trailing {
		display: flex;
		flex: none;
		align-items: center;
		gap: 10px;
		font-size: 13px;
		color: var(--text-muted);
	}
</style>
