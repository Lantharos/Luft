<script lang="ts">
	import { tooltip } from '@luft/ui';
	import type { Component } from 'svelte';

	interface Props {
		label: string;
		icon: Component;
		active: boolean;
		count?: number;
		strong?: boolean;
		rail?: boolean;
		onclick: () => void;
	}

	let { label, icon: Icon, active, count = 0, strong = false, rail = false, onclick }: Props = $props();

	let shownCount = $derived(count > 999 ? '999+' : `${count}`);
</script>

{#if rail}
	<button type="button" class="item rail" class:active aria-label={count > 0 ? `${label}, ${shownCount}` : label} aria-current={active ? 'page' : undefined} {onclick} {@attach tooltip(count > 0 ? `${label} · ${shownCount}` : label)}>
		<Icon size={18} />
		{#if count > 0}
			<span class="dot" class:strong></span>
		{/if}
	</button>
{:else}
	<button type="button" class="item" class:active aria-current={active ? 'page' : undefined} {onclick}>
		<Icon size={17} />
		<span class="min-w-0 flex-1 truncate">{label}</span>
		{#if count > 0}
			<span class="count" class:strong>{shownCount}</span>
		{/if}
	</button>
{/if}

<style>
	.item {
		position: relative;
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
			background-color var(--motion-tap) var(--ease-decelerate),
			color var(--motion-tap) var(--ease-decelerate),
			transform var(--motion-tap) var(--ease-decelerate);
	}

	.item.rail {
		height: 40px;
		justify-content: center;
		padding: 0;
	}

	.item:hover {
		background: var(--sidebar-control);
		color: var(--text);
	}

	.item.active {
		background: transparent;
		color: var(--text);
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

	.dot {
		position: absolute;
		top: 9px;
		left: calc(50% + 7px);
		height: 7px;
		width: 7px;
		border-radius: 50%;
		background: var(--sidebar-text-muted);
	}

	.dot.strong {
		background: var(--accent);
	}
</style>
