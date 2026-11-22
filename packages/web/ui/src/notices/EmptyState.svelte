<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface EmptyAction {
		label: string;
		run: () => unknown;
	}

	export interface EmptyStateProps {
		icon?: Component;
		title: string;
		message?: string;
		action?: EmptyAction;
		tone?: 'neutral' | 'danger';
	}
</script>

<script lang="ts">
	let { icon: Icon, title, message, action, tone = 'neutral' }: EmptyStateProps = $props();
</script>

<div class={['empty-state', tone === 'danger' && 'is-danger']} role="status">
	{#if Icon}
		<span class="empty-state__icon"><Icon size={24} /></span>
	{/if}
	<p class="empty-state__title">{title}</p>
	{#if message}
		<p class="empty-state__message">{message}</p>
	{/if}
	{#if action}
		<button class="button mt-2" type="button" onclick={action.run}>{action.label}</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		min-height: 0;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 24px;
		text-align: center;
		animation: empty-in var(--motion-standard) var(--ease-decelerate) both;
	}

	.empty-state__icon {
		display: grid;
		height: 52px;
		width: 52px;
		margin-bottom: 10px;
		place-items: center;
		border-radius: var(--radius-pill);
		background: var(--surface);
		color: var(--text-muted);
	}

	.empty-state.is-danger .empty-state__icon {
		color: var(--danger);
	}

	.empty-state__title {
		color: var(--text);
		font-size: 15px;
		font-weight: 500;
	}

	.empty-state__message {
		max-width: 340px;
		color: var(--text-muted);
		font-size: 13px;
		text-wrap: pretty;
		overflow-wrap: anywhere;
	}

	:global(:root[data-motion='reduced']) .empty-state {
		animation-name: fade-in;
	}

	@keyframes empty-in {
		from {
			opacity: 0;
			scale: 0.98;
		}
	}
</style>
