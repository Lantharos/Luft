<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		title: string;
		description?: string;
		icon?: Component;
		disabled?: boolean;
		truncate?: boolean;
		expanded?: boolean;
		onclick?: () => void;
		children?: Snippet;
		below?: Snippet;
	}

	let { title, description, icon: Icon, disabled = false, truncate = false, expanded, onclick, children, below }: Props = $props();
</script>

{#snippet content()}
	<div class="line">
		{#if Icon}
			<span class="icon"><Icon size={20} /></span>
		{/if}
		<div class="text">
			<span class="title">{title}</span>
			{#if description}
				<span class="description" class:truncate>{description}</span>
			{/if}
		</div>
		{#if children}
			<div class="trailing">{@render children()}</div>
		{/if}
		{#if onclick}
			<ChevronRight size={18} class="shrink-0 text-[var(--text-muted)] transition-transform duration-200 {expanded ? 'rotate-90' : ''}" />
		{/if}
	</div>
	{#if below}
		<div class="below">{@render below()}</div>
	{/if}
{/snippet}

{#if onclick}
	<button type="button" class="row interactive" aria-expanded={expanded} {disabled} {onclick}>{@render content()}</button>
{:else}
	<div class="row" class:disabled>{@render content()}</div>
{/if}

<style>
	.row {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 12px;
		padding: 14px 16px;
		text-align: left;
	}

	.row.disabled,
	.row:disabled {
		opacity: 0.45;
	}

	.interactive {
		transition: background-color 160ms var(--ease);
	}

	.interactive:hover:not(:disabled) {
		background: var(--surface-hover);
	}

	.line {
		display: flex;
		min-height: 28px;
		align-items: center;
		gap: 14px;
	}

	.icon {
		display: grid;
		flex: none;
		place-items: center;
		color: var(--text-soft);
	}

	.text {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 2px;
	}

	.title,
	.truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		font-size: 14px;
		font-weight: 500;
		color: var(--text);
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

	.below {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
