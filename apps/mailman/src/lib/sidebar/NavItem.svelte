<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		label: string;
		icon: Component;
		active: boolean;
		count?: number;
		strong?: boolean;
		onclick: () => void;
	}

	let { label, icon: Icon, active, count = 0, strong = false, onclick }: Props = $props();
</script>

<button type="button" class="item" class:active aria-current={active ? 'page' : undefined} {onclick}>
	<Icon size={17} />
	<span class="min-w-0 flex-1 truncate">{label}</span>
	{#if count > 0}
		<span class="count" class:strong>{count > 999 ? '999+' : count}</span>
	{/if}
</button>

<style>
	.item {
		display: flex;
		height: 36px;
		width: 100%;
		flex: none;
		align-items: center;
		gap: 12px;
		border-radius: var(--radius-pill);
		padding-inline: 12px 14px;
		text-align: left;
		font-size: 14px;
		color: var(--sidebar-text);
		transition:
			background-color 150ms var(--ease),
			color 150ms var(--ease),
			transform 150ms var(--ease);
	}

	.item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.item.active {
		background: var(--sidebar-active);
		color: var(--text);
		font-weight: 500;
	}

	.item:active {
		transform: scale(0.97);
	}

	.count {
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		color: var(--sidebar-text-muted);
	}

	.count.strong {
		color: var(--text);
		font-weight: 600;
	}
</style>
