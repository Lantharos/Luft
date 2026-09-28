<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		alert?: boolean;
		icon: Component;
		disabled?: boolean;
		onclick: () => void;
		trailing?: Snippet;
		actions?: Snippet;
	}

	let { title, description, alert = false, icon: Icon, disabled = false, onclick, trailing, actions }: Props = $props();
</script>

<div class="action-row" class:disabled>
	<button type="button" class="main" {disabled} {onclick}>
		<span class="icon"><Icon size={20} /></span>
		<span class="text">
			<span class="title">{title}</span>
			{#if description}
				<span class="description" class:alert>{description}</span>
			{/if}
		</span>
		{#if trailing}
			<span class="trailing">{@render trailing()}</span>
		{/if}
	</button>
	{#if actions}
		<div class="actions">{@render actions()}</div>
	{/if}
</div>

<style>
	.action-row {
		display: flex;
		align-items: center;
		transition: background-color 160ms var(--ease);
	}

	.action-row:has(.main:hover:not(:disabled)) {
		background: var(--surface-hover);
	}

	.main {
		display: flex;
		min-width: 0;
		min-height: 56px;
		flex: 1;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		text-align: left;
	}

	.disabled .main {
		opacity: 0.45;
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

	.description.alert {
		color: var(--danger);
	}

	.trailing {
		display: flex;
		flex: none;
		align-items: center;
		gap: 10px;
		color: var(--text-muted);
	}

	.actions {
		display: flex;
		flex: none;
		align-items: center;
		gap: 4px;
		padding-right: 12px;
	}
</style>
