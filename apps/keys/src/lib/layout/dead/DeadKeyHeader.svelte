<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		symbol: string;
		name: string;
		where: string;
		children: Snippet;
	}

	let { symbol, name, where, children }: Props = $props();
</script>

<header class="flex items-center gap-4 px-1.5">
	<span class="symbol" aria-hidden="true">{symbol}</span>
	<div class="min-w-0 flex-1">
		<h2 class="truncate text-[18px] font-semibold">{name}</h2>
		<p class="truncate text-[13px] text-[var(--text-muted)]">{where}</p>
	</div>
	{@render children()}
</header>

<style>
	.symbol {
		display: grid;
		height: 52px;
		width: 52px;
		flex: none;
		place-items: center;
		border-radius: 16px;
		background: var(--control);
		font-size: 28px;
		color: var(--secondary);
	}
</style>
