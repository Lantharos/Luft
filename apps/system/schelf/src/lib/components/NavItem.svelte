<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	interface Props {
		title: string;
		icon?: Component;
		active?: boolean;
		count?: number;
		onclick: () => void;
		leading?: Snippet;
	}

	let { title, icon: Icon, active = false, count, onclick, leading }: Props = $props();
</script>

<button type="button" class="nav-item" class:active aria-current={active ? 'page' : undefined} {onclick}>
	{#if leading}
		{@render leading()}
	{:else if Icon}
		<Icon size={18} />
	{/if}
	<span class="flex-1 truncate">{title}</span>
	{#if count}
		<span class="count">{count}</span>
	{/if}
</button>

<style>
	.nav-item {
		display: flex;
		height: 38px;
		width: 100%;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 12px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition: background-color var(--motion-tap) var(--ease-decelerate), color var(--motion-tap) var(--ease-decelerate), transform var(--motion-tap) var(--ease-decelerate);
	}

	.nav-item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.nav-item.active {
		background: transparent;
		color: var(--text);
	}

	.nav-item:active {
		transform: scale(0.97);
	}

	.count {
		font-size: 13px;
		font-variant-numeric: tabular-nums;
		color: var(--sidebar-text-muted);
	}
</style>
