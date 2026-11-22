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
		<span class="nav-count">{count}</span>
	{/if}
</button>

