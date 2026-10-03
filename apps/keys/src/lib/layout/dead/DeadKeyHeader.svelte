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

<header class="flex items-center gap-3.5 px-1.5">
	<span class="symbol" aria-hidden="true">{symbol}</span>
	<div class="min-w-0 flex-1">
		<h2 class="truncate text-[17px] font-semibold">{name}</h2>
		<p class="truncate text-[13px] text-[var(--text-muted)]">{where}</p>
	</div>
	<div class="flex flex-none items-center gap-1">{@render children()}</div>
</header>

<style>
	.symbol {
		display: grid;
		height: 44px;
		width: 44px;
		flex: none;
		place-items: center;
		border-radius: 14px;
		background: var(--control);
		font-size: 24px;
		color: var(--secondary);
	}
</style>
